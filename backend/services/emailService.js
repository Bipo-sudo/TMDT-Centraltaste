require('dotenv').config();

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

function getFromEmail() {
  if (!process.env.EMAIL_FROM) {
    throw new Error('EMAIL_FROM is not configured');
  }

  return process.env.EMAIL_FROM;
}

async function sendWelcomeEmail(email, name) {
  return resend.emails.send({
    from: getFromEmail(),
    to: email,
    subject: 'Chào mừng bạn đến với CentralTaste',
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
        <h2>Xin chào ${name || 'bạn'}!</h2>
        <p>Cảm ơn bạn đã đăng nhập bằng Google vào CentralTaste.</p>
        <p>Chúng tôi rất vui được đồng hành cùng bạn trong hành trình khám phá đặc sản miền Trung.</p>
        <p style="margin-top:24px">Trân trọng,<br/>CentralTaste Team</p>
      </div>
    `,
  });
}

async function sendOTPEmail(email, otpCode) {
  return resend.emails.send({
    from: getFromEmail(),
    to: email,
    subject: 'Mã OTP xác thực tài khoản CentralTaste',
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
        <h2>Mã OTP của bạn</h2>
        <p>Vui lòng dùng mã dưới đây để xác thực tài khoản trong vòng 5 phút:</p>
        <div style="display:inline-block;padding:12px 18px;font-size:24px;font-weight:bold;letter-spacing:4px;background:#111827;color:#ffffff;border-radius:10px">
          ${otpCode}
        </div>
        <p style="margin-top:24px">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>
      </div>
    `,
  });
}

async function sendInvoiceEmail(email, orderDetails, trackingNumber) {
  const items = Array.isArray(orderDetails.items) ? orderDetails.items : [];

  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb">${item.name}</td>
          <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;text-align:center">${item.quantity}</td>
          <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;text-align:right">${Number(item.line_total_vnd || 0).toLocaleString('vi-VN')} VND</td>
        </tr>
      `
    )
    .join('');

  const totalAmount = Number(orderDetails.total_amount_vnd || 0).toLocaleString('vi-VN');

  return resend.emails.send({
    from: getFromEmail(),
    to: email,
    subject: `Hóa đơn đơn hàng ${orderDetails.order_id}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.7;color:#111827;background:#f9fafb;padding:24px">
        <div style="max-width:720px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px;border:1px solid #e5e7eb">
          <h2 style="margin-top:0">Cảm ơn bạn đã mua hàng tại CentralTaste</h2>
          <p>Đơn hàng của bạn đã được ghi nhận và đang được xử lý.</p>

          <div style="margin:24px 0;padding:16px;background:#f3f4f6;border-radius:12px">
            <p style="margin:0 0 8px 0"><strong>Mã đơn hàng:</strong> ${orderDetails.order_id}</p>
            <p style="margin:0 0 8px 0"><strong>Phương thức thanh toán:</strong> ${orderDetails.payment_method}</p>
            <p style="margin:0 0 8px 0"><strong>Địa chỉ giao hàng:</strong> ${orderDetails.shipping_address}</p>
            <p style="margin:0"><strong>Mã vận đơn:</strong> ${trackingNumber}</p>
          </div>

          <h3 style="margin-bottom:12px">Danh sách sản phẩm</h3>
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr>
                <th style="text-align:left;padding:12px 8px;border-bottom:2px solid #d1d5db">Sản phẩm</th>
                <th style="text-align:center;padding:12px 8px;border-bottom:2px solid #d1d5db">Số lượng</th>
                <th style="text-align:right;padding:12px 8px;border-bottom:2px solid #d1d5db">Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml || '<tr><td colspan="3" style="padding:12px 8px">Không có dữ liệu sản phẩm</td></tr>'}
            </tbody>
          </table>

          <div style="margin-top:20px;padding-top:16px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center">
            <strong>Tổng cộng</strong>
            <strong>${totalAmount} VND</strong>
          </div>
        </div>
      </div>
    `,
  });
}

module.exports = {
  sendWelcomeEmail,
  sendOTPEmail,
  sendInvoiceEmail,
};