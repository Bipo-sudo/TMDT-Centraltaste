const crypto = require('crypto');
const { pool } = require('../config/db');

async function getAllProducts(req, res, next) {
  try {
    const { featured } = req.query;
    const limitClause = featured === 'true' ? 'LIMIT 6' : '';

    const [rows] = await pool.execute(
      `
        SELECT
          p.id,
          p.category_slug,
          c.name_vi AS category_name_vi,
          c.name_en AS category_name_en,
          p.view_count,
          p.sales_count,
          p.price_vnd,
          p.price_usd,
          p.weight_gram,
          p.unit,
          p.stock,
          p.name_vi,
          p.name_en,
          p.tagline_vi,
          p.tagline_en,
          p.summary_vi,
          p.summary_en,
          p.main_image_url,
          p.intro_video_url
        FROM products p
        INNER JOIN categories c ON p.category_slug = c.slug
        ORDER BY (p.sales_count * 5 + p.view_count) DESC, p.id ASC
        ${limitClause}
      `,
      []
    );

    return res.status(200).json({
      success: true,
      message: 'Products fetched successfully',
      data: rows,
    });
  } catch (error) {
    return next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const {
      name_vi,
      price_vnd,
      stock,
      summary_vi,
      ingredients_vi,
      shelf_life_vi,
      main_image_url,
    } = req.body;

    if (!name_vi || !String(name_vi).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tên sản phẩm là bắt buộc',
      });
    }

    const [categoryRows] = await pool.execute(
      'SELECT slug FROM categories ORDER BY slug ASC LIMIT 1'
    );

    if (categoryRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy category mặc định để tạo sản phẩm',
      });
    }

    const productId = `prd_${crypto.randomUUID().replace(/-/g, '')}`;
    const defaultCategorySlug = categoryRows[0].slug;
    const normalizedNameVi = String(name_vi).trim();

    await pool.execute(
      `
        INSERT INTO products (
          id,
          category_slug,
          price_vnd,
          stock,
          name_vi,
          name_en,
          summary_vi,
          main_image_url,
          shelf_life_vi,
          ingredients_vi
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        productId,
        defaultCategorySlug,
        Number(price_vnd || 0),
        Number(stock || 0),
        normalizedNameVi,
        normalizedNameVi,
        summary_vi || null,
        main_image_url || null,
        shelf_life_vi || null,
        ingredients_vi || null,
      ]
    );

    const [rows] = await pool.execute(
      `
        SELECT
          id,
          category_slug,
          price_vnd,
          stock,
          name_vi,
          name_en,
          summary_vi,
          main_image_url,
          shelf_life_vi,
          ingredients_vi
        FROM products
        WHERE id = ?
        LIMIT 1
      `,
      [productId]
    );

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: rows[0] || {
        id: productId,
        category_slug: defaultCategorySlug,
        price_vnd: Number(price_vnd || 0),
        stock: Number(stock || 0),
        name_vi: normalizedNameVi,
        name_en: normalizedNameVi,
        summary_vi: summary_vi || null,
        main_image_url: main_image_url || null,
        shelf_life_vi: shelf_life_vi || null,
        ingredients_vi: ingredients_vi || null,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function getTrendingProducts(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `
        SELECT
          p.id,
          p.category_slug,
          c.name_vi AS category_name_vi,
          c.name_en AS category_name_en,
          p.view_count,
          p.sales_count,
          p.price_vnd,
          p.price_usd,
          p.weight_gram,
          p.unit,
          p.stock,
          p.name_vi,
          p.name_en,
          p.tagline_vi,
          p.tagline_en,
          p.summary_vi,
          p.summary_en,
          p.main_image_url,
          p.intro_video_url,
          (p.sales_count * 5 + p.view_count) AS interaction_score
        FROM products p
        INNER JOIN categories c ON p.category_slug = c.slug
        ORDER BY interaction_score DESC, p.id ASC
        LIMIT 6
      `
    );

    return res.status(200).json({
      success: true,
      message: 'Trending products fetched successfully',
      data: rows,
    });
  } catch (error) {
    return next(error);
  }
}

async function incrementViewCount(req, res, next) {
  try {
    const { id } = req.params;

    const [result] = await pool.execute('UPDATE products SET view_count = view_count + 1 WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: 'No product found to increment view count',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'View count incremented successfully',
      data: {
        product_id: id,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const { id } = req.params;

    const [productRows, storyRows, stepRows, certificationRows, enjoyRows] = await Promise.all([
      pool.execute(
        `
          SELECT
            p.id,
            p.category_slug,
            c.name_vi AS category_name_vi,
            c.name_en AS category_name_en,
            p.view_count,
            p.sales_count,
            p.price_vnd,
            p.price_usd,
            p.weight_gram,
            p.unit,
            p.stock,
            p.name_vi,
            p.name_en,
            p.tagline_vi,
            p.tagline_en,
            p.summary_vi,
            p.summary_en,
            p.main_image_url,
            p.intro_video_url,
            p.shelf_life_vi,
            p.shelf_life_en,
            p.preservation_vi,
            p.preservation_en,
            p.ingredients_vi,
            p.ingredients_en,
            p.allergens_vi,
            p.allergens_en,
            p.suitable_for_vegan,
            p.shipping_vi,
            p.shipping_en,
            p.packaging_vi,
            p.packaging_en,
            p.guarantee_vi,
            p.guarantee_en
          FROM products p
          INNER JOIN categories c ON p.category_slug = c.slug
          WHERE p.id = ?
          LIMIT 1
        `,
        [id]
      ),
      pool.execute('SELECT * FROM product_stories WHERE product_id = ? LIMIT 1', [id]),
      pool.execute('SELECT * FROM production_steps WHERE product_id = ? ORDER BY step_number ASC, id ASC', [id]),
      pool.execute('SELECT * FROM certifications WHERE product_id = ? ORDER BY id ASC', [id]),
      pool.execute('SELECT * FROM how_to_enjoy WHERE product_id = ? ORDER BY id ASC', [id]),
    ]);

    const product = productRows[0][0];

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: 'No product found with the provided id',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product fetched successfully',
      data: {
        product,
        story: storyRows[0][0] || null,
        productionSteps: stepRows[0],
        certifications: certificationRows[0],
        howToEnjoy: enjoyRows[0],
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  getTrendingProducts,
  incrementViewCount,
  getProductById,
};