const { pool } = require('../config/db');

async function getCart(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `
        SELECT
          ci.id,
          ci.user_email,
          ci.product_id,
          ci.quantity,
          p.name_vi,
          p.name_en,
          p.price_vnd,
          p.main_image_url,
          (p.price_vnd * ci.quantity) AS line_total_vnd
        FROM cart_items ci
        INNER JOIN products p ON ci.product_id = p.id
        WHERE ci.user_email = ?
        ORDER BY ci.id ASC
      `,
      [req.user.email]
    );

    const totalAmountVnd = rows.reduce((sum, item) => sum + Number(item.line_total_vnd || 0), 0);

    return res.status(200).json({
      success: true,
      message: 'Cart fetched successfully',
      data: {
        items: rows,
        total_amount_vnd: totalAmountVnd,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function addToCart(req, res, next) {
  const connection = await pool.getConnection();

  try {
    const { product_id, quantity } = req.body;
    const addQuantity = Number(quantity || 1);

    if (!product_id || !Number.isInteger(addQuantity) || addQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'product_id and a positive integer quantity are required',
        error: 'Invalid cart payload',
      });
    }

    const [productRows] = await connection.execute(
      'SELECT id, stock FROM products WHERE id = ? LIMIT 1',
      [product_id]
    );

    if (productRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: 'No product found for cart item',
      });
    }

    const [existingRows] = await connection.execute(
      'SELECT id, quantity FROM cart_items WHERE user_email = ? AND product_id = ? LIMIT 1',
      [req.user.email, product_id]
    );

    const currentQuantity = existingRows.length > 0 ? Number(existingRows[0].quantity) : 0;
    const totalQuantity = currentQuantity + addQuantity;

    if (totalQuantity > Number(productRows[0].stock || 0)) {
      return res.status(400).json({
        success: false,
        message: 'Requested quantity exceeds available stock',
        error: 'Insufficient stock for cart item',
      });
    }

    if (existingRows.length > 0) {
      await connection.execute('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?', [addQuantity, existingRows[0].id]);
    } else {
      await connection.execute(
        'INSERT INTO cart_items (user_email, product_id, quantity) VALUES (?, ?, ?)',
        [req.user.email, product_id, addQuantity]
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        product_id,
        quantity: addQuantity,
      },
    });
  } catch (error) {
    return next(error);
  } finally {
    connection.release();
  }
}

async function updateCartItem(req, res, next) {
  const connection = await pool.getConnection();

  try {
    const cartItemId = req.params.cart_item_id;
    const { quantity_delta, quantity } = req.body;

    let delta = null;

    if (quantity_delta !== undefined) {
      delta = Number(quantity_delta);
      if (!Number.isInteger(delta) || delta === 0) {
        return res.status(400).json({
          success: false,
          message: 'quantity_delta must be a non-zero integer',
          error: 'Invalid quantity delta',
        });
      }
    }

    let targetQuantity = null;
    if (quantity !== undefined) {
      targetQuantity = Number(quantity);
      if (!Number.isInteger(targetQuantity) || targetQuantity < 0) {
        return res.status(400).json({
          success: false,
          message: 'quantity must be a non-negative integer',
          error: 'Invalid quantity',
        });
      }
    }

    const [cartRows] = await connection.execute(
      'SELECT id, product_id, quantity FROM cart_items WHERE id = ? AND user_email = ? LIMIT 1',
      [cartItemId, req.user.email]
    );

    if (cartRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found',
        error: 'No cart item found for this user',
      });
    }

    const cartItem = cartRows[0];
    const newQuantity = targetQuantity !== null ? targetQuantity : Number(cartItem.quantity) + delta;

    if (newQuantity <= 0) {
      await connection.execute('DELETE FROM cart_items WHERE id = ?', [cartItem.id]);
      return res.status(200).json({
        success: true,
        message: 'Cart item removed because quantity reached zero',
        data: {
          cart_item_id: cartItem.id,
        },
      });
    }

    const [productRows] = await connection.execute(
      'SELECT stock FROM products WHERE id = ? LIMIT 1',
      [cartItem.product_id]
    );

    if (productRows.length === 0 || newQuantity > Number(productRows[0].stock || 0)) {
      return res.status(400).json({
        success: false,
        message: 'Requested quantity exceeds available stock',
        error: 'Insufficient stock for cart item',
      });
    }

    await connection.execute('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQuantity, cartItem.id]);

    return res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      data: {
        cart_item_id: cartItem.id,
        quantity: newQuantity,
      },
    });
  } catch (error) {
    return next(error);
  } finally {
    connection.release();
  }
}

async function deleteCartItem(req, res, next) {
  try {
    const [result] = await pool.execute(
      'DELETE FROM cart_items WHERE id = ? AND user_email = ?',
      [req.params.cart_item_id, req.user.email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found',
        error: 'No cart item found for this user',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Cart item deleted successfully',
      data: {
        cart_item_id: Number(req.params.cart_item_id),
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
};