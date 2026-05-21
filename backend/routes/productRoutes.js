const express = require('express');
const { getAllProducts, getTrendingProducts, incrementViewCount, getProductById } = require('../controllers/productController');

const router = express.Router();

router.get('/', getAllProducts);
router.get('/trending', getTrendingProducts);
router.put('/:id/view', incrementViewCount);
router.get('/:id', getProductById);

module.exports = router;