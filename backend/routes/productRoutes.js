const express = require('express');
const {
	createProduct,
	getAllProducts,
	getTrendingProducts,
	incrementViewCount,
	getProductById,
} = require('../controllers/productController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', verifyToken, isAdmin, createProduct);
router.get('/', getAllProducts);
router.get('/trending', getTrendingProducts);
router.put('/:id/view', incrementViewCount);
router.get('/:id', getProductById);

module.exports = router;