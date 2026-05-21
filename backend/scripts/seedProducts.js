require('dotenv').config();

const { pool } = require('../config/db');

const categories = [
  { slug: 'me-xung', name_vi: 'Mè xửng', name_en: 'Sesame Candy' },
  { slug: 'tra', name_vi: 'Trà', name_en: 'Tea' },
];

function createTrendingStats(viewMin, viewMax, salesMin, salesMax) {
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  return {
    view_count: randomInt(viewMin, viewMax),
    sales_count: randomInt(salesMin, salesMax),
  };
}

const products = [
  {
    id: 'MX-HUE',
    category_slug: 'me-xung',
    ...createTrendingStats(15000, 25000, 3000, 8000),
    price_vnd: 89000,
    price_usd: 3.49,
    weight_gram: 250,
    unit: 'hộp',
    stock: 120,
    name_vi: 'Mè xửng Huế',
    name_en: 'Hue Sesame Candy',
    tagline_vi: 'Ngọt thanh, dẻo bùi.',
    tagline_en: 'Soft, nutty, and delicately sweet.',
    summary_vi: 'Mẫu thử sản phẩm Mè xửng Huế dành cho kiểm tra kết nối.',
    summary_en: 'Sample product for testing the integration.',
    main_image_url: 'https://example.com/images/mx-hue.jpg',
    intro_video_url: 'https://example.com/videos/mx-hue.mp4',
    shelf_life_vi: '12 tháng',
    shelf_life_en: '12 months',
    preservation_vi: 'Bảo quản nơi khô ráo.',
    preservation_en: 'Store in a cool, dry place.',
    ingredients_vi: 'Đậu phộng, mè, đường mạch nha.',
    ingredients_en: 'Peanuts, sesame, malt syrup.',
    allergens_vi: 'Có đậu phộng.',
    allergens_en: 'Contains peanuts.',
    suitable_for_vegan: true,
    shipping_vi: 'Đóng gói chống ẩm.',
    shipping_en: 'Moisture-proof packaging.',
    packaging_vi: 'Hộp quà premium.',
    packaging_en: 'Premium gift box.',
    guarantee_vi: 'Đổi trả khi lỗi sản xuất.',
    guarantee_en: 'Exchange if manufacturing defect.',
    story: {
      origin_vi: 'Trích đoạn ngắn về nguồn gốc Mè xửng Huế.',
      origin_en: 'Short origin note for Hue sesame candy.',
      culture_vi: 'Gắn với ký ức ẩm thực cố đô.',
      culture_en: 'Connected to the culinary memory of Hue.',
      philosophy_vi: 'Tinh tế trong từng lớp ngọt.',
      philosophy_en: 'Refined sweetness in every layer.',
      geo_impact_vi: 'Nguyên liệu địa phương.',
      geo_impact_en: 'Locally sourced ingredients.',
      sustainability_vi: 'Ưu tiên bao bì tái chế.',
      sustainability_en: 'Prioritizes recyclable packaging.',
      intl_friendly_quote: 'A timeless sweet souvenir from central Vietnam.',
    },
    steps: [
      { step_number: 1, step_image_url: 'https://example.com/steps/mx-1.jpg', desc_vi: 'Chọn nguyên liệu.', desc_en: 'Select ingredients.' },
      { step_number: 2, step_image_url: 'https://example.com/steps/mx-2.jpg', desc_vi: 'Nấu mạch nha.', desc_en: 'Cook malt syrup.' },
    ],
    certifications: [
      { cert_name: 'OCOP', cert_icon: 'oc' },
      { cert_name: 'HACCP', cert_icon: 'hc' },
    ],
    howToEnjoy: [
      { tip_vi: 'Dùng với trà nóng.', tip_en: 'Enjoy with hot tea.' },
    ],
  },
  {
    id: 'TCD-HUE',
    category_slug: 'tra',
    ...createTrendingStats(15000, 25000, 3000, 8000),
    price_vnd: 159000,
    price_usd: 6.29,
    weight_gram: 120,
    unit: 'hộp',
    stock: 80,
    name_vi: 'Trà cung đình Huế',
    name_en: 'Hue Imperial Herbal Tea',
    tagline_vi: 'Thanh vị hoàng cung.',
    tagline_en: 'An imperial herbal blend.',
    summary_vi: 'Mẫu thử trà cung đình cho kiểm tra Aiven.',
    summary_en: 'Test product for database seeding.',
    main_image_url: 'https://example.com/images/tcd-hue.jpg',
    intro_video_url: 'https://example.com/videos/tcd-hue.mp4',
    shelf_life_vi: '18 tháng',
    shelf_life_en: '18 months',
    preservation_vi: 'Tránh ánh nắng trực tiếp.',
    preservation_en: 'Avoid direct sunlight.',
    ingredients_vi: 'Thảo mộc, hoa cúc, cam thảo.',
    ingredients_en: 'Herbs, chrysanthemum, licorice root.',
    allergens_vi: 'Không đáng kể.',
    allergens_en: 'None significant.',
    suitable_for_vegan: true,
    shipping_vi: 'Đóng hộp kín.',
    shipping_en: 'Sealed box packaging.',
    packaging_vi: 'Hộp giấy cao cấp.',
    packaging_en: 'Premium paper box.',
    guarantee_vi: 'Bảo đảm chất lượng.',
    guarantee_en: 'Quality guaranteed.',
    story: {
      origin_vi: 'Nguồn gốc trà cung đình.',
      origin_en: 'Origin of imperial herbal tea.',
      culture_vi: 'Thức uống gắn với hoàng thành.',
      culture_en: 'A drink tied to imperial culture.',
      philosophy_vi: 'Cân bằng và thư giãn.',
      philosophy_en: 'Balance and relaxation.',
      geo_impact_vi: 'Phối trộn thảo mộc vùng miền.',
      geo_impact_en: 'Regional herb blending.',
      sustainability_vi: 'Bao bì thân thiện môi trường.',
      sustainability_en: 'Eco-friendly packaging.',
      intl_friendly_quote: 'A fragrant tea inspired by royal heritage.',
    },
    steps: [
      { step_number: 1, step_image_url: 'https://example.com/steps/tcd-1.jpg', desc_vi: 'Sấy thảo mộc.', desc_en: 'Dry the herbs.' },
      { step_number: 2, step_image_url: 'https://example.com/steps/tcd-2.jpg', desc_vi: 'Phối trộn vị.', desc_en: 'Blend the flavors.' },
    ],
    certifications: [
      { cert_name: 'ISO', cert_icon: 'is' },
    ],
    howToEnjoy: [
      { tip_vi: 'Hãm với nước ấm 90°C.', tip_en: 'Steep in 90°C water.' },
    ],
  },
  {
    id: 'TC-HUE',
    category_slug: 'tra',
    ...createTrendingStats(15000, 25000, 3000, 8000),
    price_vnd: 99000,
    price_usd: 3.89,
    weight_gram: 100,
    unit: 'gói',
    stock: 150,
    name_vi: 'Trà sen Huế',
    name_en: 'Hue Lotus Tea',
    tagline_vi: 'Hương sen dịu nhẹ.',
    tagline_en: 'Gentle lotus aroma.',
    summary_vi: 'Mẫu thử trà sen để test dữ liệu.',
    summary_en: 'Sample lotus tea product.',
    main_image_url: 'https://example.com/images/tc-hue.jpg',
    intro_video_url: 'https://example.com/videos/tc-hue.mp4',
    shelf_life_vi: '12 tháng',
    shelf_life_en: '12 months',
    preservation_vi: 'Đậy kín sau khi mở.',
    preservation_en: 'Keep sealed after opening.',
    ingredients_vi: 'Trà xanh, hương sen.',
    ingredients_en: 'Green tea, lotus scent.',
    allergens_vi: 'Không.',
    allergens_en: 'None.',
    suitable_for_vegan: true,
    shipping_vi: 'Giao hàng tiêu chuẩn.',
    shipping_en: 'Standard shipping.',
    packaging_vi: 'Túi zip.',
    packaging_en: 'Zip pouch.',
    guarantee_vi: 'Đúng mô tả.',
    guarantee_en: 'As described.',
    story: {
      origin_vi: 'Mẫu ngắn cho trà sen.',
      origin_en: 'Short origin note for lotus tea.',
      culture_vi: 'Hương sen quen thuộc xứ Huế.',
    culture_en: "Hue's familiar lotus aroma.",
      philosophy_vi: 'Tinh khiết và an nhiên.',
      philosophy_en: 'Pure and serene.',
      geo_impact_vi: 'Chọn lọc lá trà sạch.',
      geo_impact_en: 'Selected clean tea leaves.',
      sustainability_vi: 'Ưu tiên vật liệu nhẹ.',
      sustainability_en: 'Lightweight materials preferred.',
      intl_friendly_quote: 'A calming tea with a floral finish.',
    },
    steps: [
      { step_number: 1, step_image_url: 'https://example.com/steps/tc-1.jpg', desc_vi: 'Ướp hương.', desc_en: 'Infuse aroma.' },
    ],
    certifications: [],
    howToEnjoy: [
      { tip_vi: 'Uống nóng để thơm hơn.', tip_en: 'Serve hot for best aroma.' },
    ],
  },
  {
    id: 'BKM-DN',
    category_slug: 'me-xung',
    ...createTrendingStats(15000, 25000, 3000, 8000),
    price_vnd: 129000,
    price_usd: 5.09,
    weight_gram: 300,
    unit: 'hộp',
    stock: 60,
    name_vi: 'Bánh kẹo miền Trung Đà Nẵng',
    name_en: 'Central Sweet Box Da Nang',
    tagline_vi: 'Quà tặng tổng hợp.',
    tagline_en: 'A curated gift assortment.',
    summary_vi: 'Mẫu combo bánh kẹo.',
    summary_en: 'Mock combo product.',
    main_image_url: 'https://example.com/images/bkm-dn.jpg',
    intro_video_url: 'https://example.com/videos/bkm-dn.mp4',
    shelf_life_vi: '10 tháng',
    shelf_life_en: '10 months',
    preservation_vi: 'Bảo quản khô mát.',
    preservation_en: 'Keep dry and cool.',
    ingredients_vi: 'Nhiều loại bánh kẹo.',
    ingredients_en: 'Assorted sweets.',
    allergens_vi: 'Có thể chứa gluten.',
    allergens_en: 'May contain gluten.',
    suitable_for_vegan: false,
    shipping_vi: 'Đóng hộp chống sốc.',
    shipping_en: 'Shock-resistant packaging.',
    packaging_vi: 'Hộp quà đa ngăn.',
    packaging_en: 'Multi-compartment gift box.',
    guarantee_vi: 'Đổi khi hư hỏng.',
    guarantee_en: 'Replace if damaged.',
    story: {
      origin_vi: 'Combo thử nghiệm cho thị trường.',
      origin_en: 'Experimental combo for the market.',
      culture_vi: 'Tổng hợp đặc sản miền Trung.',
      culture_en: 'A mix of central specialties.',
      philosophy_vi: 'Đa dạng hương vị.',
      philosophy_en: 'A variety of flavors.',
      geo_impact_vi: 'Thu mua từ nhiều làng nghề.',
      geo_impact_en: 'Sourced from multiple craft villages.',
      sustainability_vi: 'Ưu tiên phân loại vật liệu.',
      sustainability_en: 'Material sorting is prioritized.',
      intl_friendly_quote: 'A versatile souvenir box from central Vietnam.',
    },
    steps: [
      { step_number: 1, step_image_url: 'https://example.com/steps/bkm-1.jpg', desc_vi: 'Tuyển chọn món.', desc_en: 'Select items.' },
    ],
    certifications: [
      { cert_name: 'Gift Ready', cert_icon: 'gr' },
    ],
    howToEnjoy: [
      { tip_vi: 'Phù hợp biếu tặng.', tip_en: 'Suitable as a gift.' },
    ],
  },
  {
    id: 'CP-TN',
    category_slug: 'tra',
    ...createTrendingStats(15000, 25000, 3000, 8000),
    price_vnd: 189000,
    price_usd: 7.49,
    weight_gram: 500,
    unit: 'hộp',
    stock: 95,
    name_vi: 'Cà phê Tây Nguyên',
    name_en: 'Central Highlands Coffee',
    tagline_vi: 'Đậm vị cao nguyên.',
    tagline_en: 'Bold highland flavor.',
    summary_vi: 'Mẫu thử cà phê rang xay.',
    summary_en: 'Mock roasted coffee product.',
    main_image_url: 'https://example.com/images/cp-tn.jpg',
    intro_video_url: 'https://example.com/videos/cp-tn.mp4',
    shelf_life_vi: '24 tháng',
    shelf_life_en: '24 months',
    preservation_vi: 'Đậy kín nắp.',
    preservation_en: 'Keep the lid closed.',
    ingredients_vi: '100% hạt cà phê.',
    ingredients_en: '100% coffee beans.',
    allergens_vi: 'Không.',
    allergens_en: 'None.',
    suitable_for_vegan: true,
    shipping_vi: 'Đóng gói hút chân không.',
    shipping_en: 'Vacuum-sealed packaging.',
    packaging_vi: 'Lon thiếc.',
    packaging_en: 'Tin can packaging.',
    guarantee_vi: 'Cam kết nguyên chất.',
    guarantee_en: 'Pure coffee guarantee.',
    story: {
      origin_vi: 'Nguồn gốc cà phê cao nguyên.',
      origin_en: 'Coffee origin from the highlands.',
      culture_vi: 'Văn hóa cà phê Việt.',
      culture_en: 'Vietnamese coffee culture.',
      philosophy_vi: 'Tỉnh táo và bền bỉ.',
      philosophy_en: 'Focused and resilient.',
      geo_impact_vi: 'Hỗ trợ nông hộ địa phương.',
      geo_impact_en: 'Supports local farmers.',
      sustainability_vi: 'Chọn nguồn cung bền vững.',
      sustainability_en: 'Sustainably sourced.',
      intl_friendly_quote: 'A robust coffee born in the highlands of Vietnam.',
    },
    steps: [
      { step_number: 1, step_image_url: 'https://example.com/steps/cp-1.jpg', desc_vi: 'Thu hái hạt.', desc_en: 'Harvest the beans.' },
      { step_number: 2, step_image_url: 'https://example.com/steps/cp-2.jpg', desc_vi: 'Rang xay.', desc_en: 'Roast and grind.' },
    ],
    certifications: [
      { cert_name: 'Rainforest', cert_icon: 'rf' },
    ],
    howToEnjoy: [
      { tip_vi: 'Pha phin hoặc espresso.', tip_en: 'Use a phin or espresso brew.' },
    ],
  },
  {
    id: 'COMBO-CT',
    category_slug: 'me-xung',
    ...createTrendingStats(15000, 25000, 3000, 8000),
    price_vnd: 399000,
    price_usd: 15.69,
    weight_gram: 900,
    unit: 'combo',
    stock: 40,
    name_vi: 'Combo Đặc sản miền Trung',
    name_en: 'Central Specialty Combo',
    tagline_vi: 'Tặng là mê.',
    tagline_en: 'Gift-worthy combo.',
    summary_vi: 'Combo mẫu để kiểm tra nạp dữ liệu.',
    summary_en: 'Combo sample for seeding tests.',
    main_image_url: 'https://example.com/images/combo-ct.jpg',
    intro_video_url: 'https://example.com/videos/combo-ct.mp4',
    shelf_life_vi: 'Tùy thành phần',
    shelf_life_en: 'Depends on items',
    preservation_vi: 'Theo hướng dẫn từng món.',
    preservation_en: 'Follow each item guideline.',
    ingredients_vi: 'Tổng hợp nhiều đặc sản.',
    ingredients_en: 'A curated assortment of specialties.',
    allergens_vi: 'Có thể chứa nhiều loại dị ứng.',
    allergens_en: 'May contain multiple allergens.',
    suitable_for_vegan: false,
    shipping_vi: 'Hộp quà lớn.',
    shipping_en: 'Large gift box.',
    packaging_vi: 'Bộ quà cao cấp.',
    packaging_en: 'Premium gift set.',
    guarantee_vi: 'Kiểm tra trước khi gửi.',
    guarantee_en: 'Checked before shipping.',
    story: {
      origin_vi: 'Combo tổng hợp nhiều vùng.',
      origin_en: 'A mix of many regions.',
      culture_vi: 'Món quà gói trọn tinh hoa miền Trung.',
      culture_en: 'A gift that wraps central Vietnam specialties.',
      philosophy_vi: 'Tiện lợi, chỉn chu.',
      philosophy_en: 'Convenient and polished.',
      geo_impact_vi: 'Kết nối nhiều làng nghề.',
      geo_impact_en: 'Connects several craft villages.',
      sustainability_vi: 'Hộp tái sử dụng được.',
      sustainability_en: 'Reusable packaging.',
      intl_friendly_quote: 'A convenient gift set featuring central Vietnam specialties.',
    },
    steps: [
      { step_number: 1, step_image_url: 'https://example.com/steps/combo-1.jpg', desc_vi: 'Chọn món.', desc_en: 'Pick items.' },
      { step_number: 2, step_image_url: 'https://example.com/steps/combo-2.jpg', desc_vi: 'Đóng hộp.', desc_en: 'Pack the box.' },
    ],
    certifications: [
      { cert_name: 'Premium Gift', cert_icon: 'pg' },
    ],
    howToEnjoy: [
      { tip_vi: 'Phù hợp dịp lễ tết.', tip_en: 'Best for holidays and gifting.' },
    ],
  },
];

async function runSeed() {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    console.log('Starting product seed transaction...');

    const productIds = products.map((product) => product.id);
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    await connection.query(
      `DELETE FROM how_to_enjoy WHERE product_id IN (${productIds.map(() => '?').join(',')})`,
      productIds
    );
    await connection.query(
      `DELETE FROM certifications WHERE product_id IN (${productIds.map(() => '?').join(',')})`,
      productIds
    );
    await connection.query(
      `DELETE FROM production_steps WHERE product_id IN (${productIds.map(() => '?').join(',')})`,
      productIds
    );
    await connection.query(
      `DELETE FROM product_stories WHERE product_id IN (${productIds.map(() => '?').join(',')})`,
      productIds
    );
    await connection.query(`DELETE FROM products WHERE id IN (${productIds.map(() => '?').join(',')})`, productIds);

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    for (const category of categories) {
      await connection.execute(
        `
          INSERT INTO categories (slug, name_vi, name_en)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name_vi = VALUES(name_vi),
            name_en = VALUES(name_en)
        `,
        [category.slug, category.name_vi, category.name_en]
      );
      console.log(`Inserted category: ${category.slug}`);
    }

    for (const product of products) {
      await connection.execute(
        `
          INSERT INTO products (
            id, category_slug, view_count, sales_count, price_vnd, price_usd, weight_gram, unit, stock,
            name_vi, name_en, tagline_vi, tagline_en, summary_vi, summary_en,
            main_image_url, intro_video_url, shelf_life_vi, shelf_life_en, preservation_vi, preservation_en,
            ingredients_vi, ingredients_en, allergens_vi, allergens_en, suitable_for_vegan,
            shipping_vi, shipping_en, packaging_vi, packaging_en, guarantee_vi, guarantee_en
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
          ) ON DUPLICATE KEY UPDATE
            category_slug = VALUES(category_slug),
            view_count = VALUES(view_count),
            sales_count = VALUES(sales_count),
            price_vnd = VALUES(price_vnd),
            price_usd = VALUES(price_usd),
            weight_gram = VALUES(weight_gram),
            unit = VALUES(unit),
            stock = VALUES(stock),
            name_vi = VALUES(name_vi),
            name_en = VALUES(name_en),
            tagline_vi = VALUES(tagline_vi),
            tagline_en = VALUES(tagline_en),
            summary_vi = VALUES(summary_vi),
            summary_en = VALUES(summary_en),
            main_image_url = VALUES(main_image_url),
            intro_video_url = VALUES(intro_video_url),
            shelf_life_vi = VALUES(shelf_life_vi),
            shelf_life_en = VALUES(shelf_life_en),
            preservation_vi = VALUES(preservation_vi),
            preservation_en = VALUES(preservation_en),
            ingredients_vi = VALUES(ingredients_vi),
            ingredients_en = VALUES(ingredients_en),
            allergens_vi = VALUES(allergens_vi),
            allergens_en = VALUES(allergens_en),
            suitable_for_vegan = VALUES(suitable_for_vegan),
            shipping_vi = VALUES(shipping_vi),
            shipping_en = VALUES(shipping_en),
            packaging_vi = VALUES(packaging_vi),
            packaging_en = VALUES(packaging_en),
            guarantee_vi = VALUES(guarantee_vi),
            guarantee_en = VALUES(guarantee_en)
          
        `,
        [
          product.id,
          product.category_slug,
          product.view_count,
          product.sales_count,
          product.price_vnd,
          product.price_usd,
          product.weight_gram,
          product.unit,
          product.stock,
          product.name_vi,
          product.name_en,
          product.tagline_vi,
          product.tagline_en,
          product.summary_vi,
          product.summary_en,
          product.main_image_url,
          product.intro_video_url,
          product.shelf_life_vi,
          product.shelf_life_en,
          product.preservation_vi,
          product.preservation_en,
          product.ingredients_vi,
          product.ingredients_en,
          product.allergens_vi,
          product.allergens_en,
          product.suitable_for_vegan,
          product.shipping_vi,
          product.shipping_en,
          product.packaging_vi,
          product.packaging_en,
          product.guarantee_vi,
          product.guarantee_en,
        ]
      );
      console.log(`Inserted product: ${product.id}`);

      await connection.execute(
        `
          INSERT INTO product_stories (
            product_id, origin_vi, origin_en, culture_vi, culture_en,
            philosophy_vi, philosophy_en, geo_impact_vi, geo_impact_en,
            sustainability_vi, sustainability_en, intl_friendly_quote
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          product.id,
          product.story.origin_vi,
          product.story.origin_en,
          product.story.culture_vi,
          product.story.culture_en,
          product.story.philosophy_vi,
          product.story.philosophy_en,
          product.story.geo_impact_vi,
          product.story.geo_impact_en,
          product.story.sustainability_vi,
          product.story.sustainability_en,
          product.story.intl_friendly_quote,
        ]
      );
      console.log(`Inserted product story: ${product.id}`);

      for (const step of product.steps) {
        await connection.execute(
          `
            INSERT INTO production_steps (product_id, step_number, step_image_url, desc_vi, desc_en)
            VALUES (?, ?, ?, ?, ?)
          `,
          [product.id, step.step_number, step.step_image_url, step.desc_vi, step.desc_en]
        );
      }
      console.log(`Inserted production steps: ${product.id}`);

      for (const certification of product.certifications) {
        await connection.execute(
          `
            INSERT INTO certifications (product_id, cert_name, cert_icon)
            VALUES (?, ?, ?)
          `,
          [product.id, certification.cert_name, certification.cert_icon]
        );
      }
      console.log(`Inserted certifications: ${product.id}`);

      for (const tip of product.howToEnjoy) {
        await connection.execute(
          `
            INSERT INTO how_to_enjoy (product_id, tip_vi, tip_en)
            VALUES (?, ?, ?)
          `,
          [product.id, tip.tip_vi, tip.tip_en]
        );
      }
      console.log(`Inserted how_to_enjoy tips: ${product.id}`);
    }

    await connection.commit();
    console.log('Product seed completed successfully.');
  } catch (error) {
    await connection.rollback();
    console.error('Product seed failed:', {
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

runSeed();