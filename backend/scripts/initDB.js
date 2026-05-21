require('dotenv').config();

const { pool } = require('../config/db');

const dbName = process.env.DB_NAME;

if (!dbName) {
  console.error('DB_NAME is missing in .env. Aborting schema initialization.');
  process.exit(1);
}

const escapeIdentifier = (value) => `\`${String(value).replace(/`/g, '``')}\``;

const schemaStatements = [
  {
    name: 'categories',
    sql: `
      CREATE TABLE IF NOT EXISTS categories (
        slug VARCHAR(50) PRIMARY KEY,
        name_vi VARCHAR(100) NOT NULL,
        name_en VARCHAR(100) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: 'users',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(150) UNIQUE,
        full_name VARCHAR(100),
        avatar_url VARCHAR(500),
        auth_provider VARCHAR(20) DEFAULT 'credentials',
        password_hash VARCHAR(255),
        is_verified BOOLEAN DEFAULT FALSE,
        role ENUM('admin', 'customer') DEFAULT 'customer',
        total_spent INT DEFAULT 0,
        membership_tier ENUM('bronze', 'silver', 'gold', 'platinum') DEFAULT 'bronze',
        default_shipping_address TEXT DEFAULT NULL,
        default_payment_method VARCHAR(50) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: 'orders',
    sql: `
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        user_email VARCHAR(150),
        total_amount_vnd INT,
        payment_method VARCHAR(50),
        shipping_address TEXT,
        order_status VARCHAR(20) DEFAULT 'Completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: 'products',
    sql: `
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        category_slug VARCHAR(50) NOT NULL,
        view_count INT DEFAULT 0,
        sales_count INT DEFAULT 0,
        price_vnd INT,
        price_usd DECIMAL(10,2),
        weight_gram INT,
        unit VARCHAR(20),
        stock INT DEFAULT 100,
        name_vi VARCHAR(255) NOT NULL,
        name_en VARCHAR(255) NOT NULL,
        tagline_vi VARCHAR(255),
        tagline_en VARCHAR(255),
        summary_vi TEXT,
        summary_en TEXT,
        main_image_url VARCHAR(500),
        intro_video_url VARCHAR(500),
        shelf_life_vi VARCHAR(255),
        shelf_life_en VARCHAR(255),
        preservation_vi VARCHAR(255),
        preservation_en VARCHAR(255),
        ingredients_vi TEXT,
        ingredients_en TEXT,
        allergens_vi TEXT,
        allergens_en TEXT,
        suitable_for_vegan BOOLEAN DEFAULT FALSE,
        shipping_vi TEXT,
        shipping_en TEXT,
        packaging_vi TEXT,
        packaging_en TEXT,
        guarantee_vi TEXT,
        guarantee_en TEXT,
        CONSTRAINT fk_products_category
          FOREIGN KEY (category_slug)
          REFERENCES categories(slug)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: 'cart_items',
    sql: `
      CREATE TABLE IF NOT EXISTS cart_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_email VARCHAR(150) NOT NULL,
        product_id VARCHAR(50) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        CONSTRAINT fk_cart_items_user
          FOREIGN KEY (user_email)
          REFERENCES users(email)
          ON DELETE CASCADE
          ON UPDATE CASCADE,
        CONSTRAINT fk_cart_items_product
          FOREIGN KEY (product_id)
          REFERENCES products(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: 'product_stories',
    sql: `
      CREATE TABLE IF NOT EXISTS product_stories (
        product_id VARCHAR(50) PRIMARY KEY,
        origin_vi TEXT,
        origin_en TEXT,
        culture_vi TEXT,
        culture_en TEXT,
        philosophy_vi TEXT,
        philosophy_en TEXT,
        geo_impact_vi TEXT,
        geo_impact_en TEXT,
        sustainability_vi TEXT,
        sustainability_en TEXT,
        intl_friendly_quote TEXT,
        CONSTRAINT fk_product_stories_product
          FOREIGN KEY (product_id)
          REFERENCES products(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: 'production_steps',
    sql: `
      CREATE TABLE IF NOT EXISTS production_steps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(50) NOT NULL,
        step_number INT NOT NULL,
        step_image_url VARCHAR(500),
        desc_vi TEXT,
        desc_en TEXT,
        CONSTRAINT fk_production_steps_product
          FOREIGN KEY (product_id)
          REFERENCES products(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: 'certifications',
    sql: `
      CREATE TABLE IF NOT EXISTS certifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(50) NOT NULL,
        cert_name VARCHAR(100) NOT NULL,
        cert_icon VARCHAR(10),
        CONSTRAINT fk_certifications_product
          FOREIGN KEY (product_id)
          REFERENCES products(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  {
    name: 'how_to_enjoy',
    sql: `
      CREATE TABLE IF NOT EXISTS how_to_enjoy (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(50) NOT NULL,
        tip_vi TEXT,
        tip_en TEXT,
        CONSTRAINT fk_how_to_enjoy_product
          FOREIGN KEY (product_id)
          REFERENCES products(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
];

async function dropExistingTables(connection) {
  const [tables] = await connection.query(
    `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = ?
    `,
    [dbName]
  );

  if (!tables.length) {
    console.log(`No existing tables found in database ${dbName}.`);
    return;
  }

  await connection.query('SET FOREIGN_KEY_CHECKS = 0');

  for (const table of tables) {
    const tableName = table.TABLE_NAME || table.table_name;
    await connection.query(`DROP TABLE IF EXISTS ${escapeIdentifier(tableName)}`);
    console.log(`Dropped existing table: ${tableName}`);
  }

  await connection.query('SET FOREIGN_KEY_CHECKS = 1');
}

async function createSchema(connection) {
  for (const statement of schemaStatements) {
    await connection.query(statement.sql);
    console.log(`Created table successfully: ${statement.name}`);
  }
}

async function init() {
  const connection = await pool.getConnection();

  try {
    console.log(`Initializing schema for database: ${dbName}`);
    await dropExistingTables(connection);
    await createSchema(connection);
    console.log('Database initialization completed successfully.');
  } catch (error) {
    console.error('Database initialization failed:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
    });
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
}

init();