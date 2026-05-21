const { pool } = require('../config/db');

async function getMe(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `
        SELECT
          id,
          email,
          full_name,
          avatar_url,
          auth_provider,
          is_verified,
          role,
          total_spent,
          membership_tier,
          default_shipping_address,
          default_payment_method,
          created_at
        FROM users
        WHERE email = ?
        LIMIT 1
      `,
      [req.user.email]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'No authenticated user found in database',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User profile fetched successfully',
      data: rows[0],
    });
  } catch (error) {
    return next(error);
  }
}

async function updateMe(req, res, next) {
  try {
    const { default_shipping_address, default_payment_method } = req.body;

    if (
      default_shipping_address === undefined &&
      default_payment_method === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'At least one field must be provided',
        error: 'No update payload supplied',
      });
    }

    const updateFields = [];
    const values = [];

    if (default_shipping_address !== undefined) {
      updateFields.push('default_shipping_address = ?');
      values.push(default_shipping_address || null);
    }

    if (default_payment_method !== undefined) {
      updateFields.push('default_payment_method = ?');
      values.push(default_payment_method || null);
    }

    values.push(req.user.email);

    const [result] = await pool.execute(
      `
        UPDATE users
        SET ${updateFields.join(', ')}
        WHERE email = ?
      `,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'No authenticated user found in database',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      data: {
        default_shipping_address: default_shipping_address !== undefined ? default_shipping_address : undefined,
        default_payment_method: default_payment_method !== undefined ? default_payment_method : undefined,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getMe,
  updateMe,
};