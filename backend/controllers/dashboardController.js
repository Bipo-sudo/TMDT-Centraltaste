const { pool } = require('../config/db');

async function getDashboardStats(req, res, next) {
  try {
    const [
      [revenueRows],
      [orderCountRows],
      [productCountRows],
      [customerCountRows],
      [recentOrdersRows],
    ] = await Promise.all([
      pool.execute(
        `
          SELECT COALESCE(SUM(total_amount_vnd), 0) AS total_revenue_vnd
          FROM orders
          WHERE LOWER(COALESCE(order_status, '')) <> 'cancelled'
        `
      ),
      pool.execute('SELECT COUNT(id) AS total_orders FROM orders'),
      pool.execute('SELECT COUNT(id) AS total_products FROM products'),
      pool.execute('SELECT COUNT(email) AS total_customers FROM users'),
      pool.execute(
        `
          SELECT
            o.id,
            o.user_email,
            u.full_name AS user_full_name,
            o.total_amount_vnd,
            o.order_status,
            o.created_at
          FROM orders o
          LEFT JOIN users u ON u.email = o.user_email
          ORDER BY o.created_at DESC
          LIMIT 5
        `
      ),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Dashboard stats fetched successfully',
      data: {
        total_revenue_vnd: Number(revenueRows[0]?.total_revenue_vnd || 0),
        total_orders: Number(orderCountRows[0]?.total_orders || 0),
        total_products: Number(productCountRows[0]?.total_products || 0),
        total_customers: Number(customerCountRows[0]?.total_customers || 0),
        recent_orders: recentOrdersRows,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getDashboardStats,
};