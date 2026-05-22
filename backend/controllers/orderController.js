const { pool } = require('../config/db');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

function generateOrderId() {
  return `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
}

function generateTrackingNumber() {
  return `GHTK-${Math.floor(100000000 + Math.random() * 900000000)}`;
}

function buildBillEmailHtml(orderDetails) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.7;color:#111827;background:#f9fafb;padding:24px">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px;border:1px solid #e5e7eb">
        <h2 style="margin-top:0">Đơn hàng của bạn đã được ghi nhận</h2>
        <p style="margin-bottom:20px">Cảm ơn bạn đã mua sắm tại CentralTaste. Dưới đây là thông tin đơn hàng:</p>

        <div style="background:#f3f4f6;border-radius:12px;padding:16px">
          <p style="margin:0 0 8px 0"><strong>Mã đơn:</strong> ${orderDetails.order_id}</p>
          <p style="margin:0 0 8px 0"><strong>Tổng tiền:</strong> ${Number(orderDetails.total_amount_vnd || 0).toLocaleString('vi-VN')} VND</p>
          <p style="margin:0"><strong>Phương thức thanh toán:</strong> ${orderDetails.payment_method}</p>
        </div>

        <p style="margin-top:20px;margin-bottom:0">Chúng tôi sẽ xử lý và cập nhật trạng thái đơn hàng sớm nhất.</p>
      </div>
    </div>
  `;
}

function normalizeItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('items must be a non-empty array');
  }

  return items.map((item) => {
    const productId = item.product_id;
    const quantity = Number(item.quantity);

    if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('Each item must contain product_id and a positive integer quantity');
    }

    return {
      product_id: productId,
      quantity,
    };
  });
}

function getMembershipDiscountRate(tier) {
  switch (tier) {
    case 'silver':
      return 0.05;
    case 'gold':
      return 0.1;
    case 'platinum':
      return 0.15;
    default:
      return 0;
  }
}

function getMembershipTierBySpent(totalSpent) {
  if (totalSpent > 10000000) {
    return 'platinum';
  }

  if (totalSpent > 5000000) {
    return 'gold';
  }

  if (totalSpent > 2000000) {
    return 'silver';
  }

  return 'bronze';
}

async function createOrder(req, res, next) {
  const connection = await pool.getConnection();

  try {
    console.log('TOKEN DECODED PAYLOAD:', req.user);

    if (!req.user || !req.user.is_verified) {
      return res.status(403).json({
        success: false,
        message: 'Account is not verified',
        error: 'Verified account required for checkout',
      });
    }

    const { items, payment_method, shipping_address } = req.body;
    const normalizedItems = normalizeItems(items);

    if (!payment_method || !['MoMo', 'Visa', 'COD'].includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: 'payment_method must be one of MoMo, Visa, COD',
        error: 'Invalid payment method',
      });
    }

    if (!shipping_address || typeof shipping_address !== 'string' || !shipping_address.trim()) {
      return res.status(400).json({
        success: false,
        message: 'shipping_address is required',
        error: 'Invalid shipping address',
      });
    }

    await connection.beginTransaction();

    const [userRows] = await connection.execute(
      `
        SELECT email, total_spent, membership_tier, default_shipping_address, default_payment_method
        FROM users
        WHERE email = ?
        FOR UPDATE
      `,
      [req.user.email]
    );

    if (userRows.length === 0) {
      throw new Error('Authenticated user not found in database');
    }

    const user = userRows[0];
    const orderId = generateOrderId();
    const orderItems = [];
    let totalAmountVnd = 0;

    for (const item of normalizedItems) {
      const [productRows] = await connection.execute(
        `
          SELECT id, name_vi, name_en, price_vnd, stock
          FROM products
          WHERE id = ?
          FOR UPDATE
        `,
        [item.product_id]
      );

      if (productRows.length === 0) {
        throw new Error(`Product not found: ${item.product_id}`);
      }

      const product = productRows[0];

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.id}`);
      }

      const lineTotalVnd = Number(product.price_vnd || 0) * item.quantity;
      totalAmountVnd += lineTotalVnd;

      orderItems.push({
        product_id: product.id,
        name: product.name_vi || product.name_en || product.id,
        quantity: item.quantity,
        unit_price_vnd: Number(product.price_vnd || 0),
        line_total_vnd: lineTotalVnd,
      });

      await connection.execute(
        `
          UPDATE products
          SET stock = stock - ?, sales_count = sales_count + ?
          WHERE id = ?
        `,
        [item.quantity, item.quantity, product.id]
      );
    }

    const discountRate = getMembershipDiscountRate(user.membership_tier);
    const discountAmountVnd = Math.floor(totalAmountVnd * discountRate);
    const finalAmountVnd = Math.max(totalAmountVnd - discountAmountVnd, 0);

    await connection.execute(
      `
        INSERT INTO orders (id, user_email, total_amount_vnd, payment_method, shipping_address, order_status)
        VALUES (?, ?, ?, ?, ?, 'Completed')
      `,
      [orderId, req.user.email, finalAmountVnd, payment_method, shipping_address.trim()]
    );

    await connection.execute('DELETE FROM cart_items WHERE user_email = ?', [req.user.email]);

    const updatedTotalSpent = Number(user.total_spent || 0) + finalAmountVnd;
    const updatedTier = getMembershipTierBySpent(updatedTotalSpent);

    await connection.execute(
      `
        UPDATE users
        SET
          total_spent = ?,
          membership_tier = ?,
          default_shipping_address = COALESCE(?, default_shipping_address),
          default_payment_method = COALESCE(?, default_payment_method)
        WHERE email = ?
      `,
      [
        updatedTotalSpent,
        updatedTier,
        shipping_address.trim() || null,
        payment_method || null,
        req.user.email,
      ]
    );

    await connection.commit();

    const trackingNumber = generateTrackingNumber();
    const orderDetails = {
      order_id: orderId,
      user_email: req.user.email,
      payment_method,
      shipping_address: shipping_address.trim(),
      subtotal_amount_vnd: totalAmountVnd,
      discount_rate: discountRate,
      discount_amount_vnd: discountAmountVnd,
      total_amount_vnd: finalAmountVnd,
      items: orderItems,
    };

    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: req.user.email,
        subject: `Xác nhận đơn hàng ${orderId}`,
        html: buildBillEmailHtml(orderDetails),
      });
    } catch (emailError) {
      console.error('Order bill email failed to send:', {
        message: emailError.message,
        code: emailError.code,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Checkout completed successfully',
      data: {
        order: orderDetails,
        tracking_number: trackingNumber,
        membership_tier: updatedTier,
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error('LỖI TẠO ĐƠN HÀNG CHI TIẾT:', error);

    return next(error);
  } finally {
    connection.release();
  }
}

async function getMyOrders(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `
        SELECT id, user_email, total_amount_vnd, payment_method, shipping_address, order_status, created_at
        FROM orders
        WHERE user_email = ?
        ORDER BY created_at DESC
      `,
      [req.user.email]
    );

    return res.status(200).json({
      success: true,
      message: 'User orders fetched successfully',
      data: rows,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createOrder,
  getMyOrders,
};