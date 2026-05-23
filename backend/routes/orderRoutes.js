const express = require('express');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const {
	createOrder,
	getAllOrders,
	getOrderById,
	getMyOrders,
	updateOrderStatus,
} = require('../controllers/orderController');

const router = express.Router();

router.post('/', verifyToken, createOrder);
router.post('/checkout', verifyToken, createOrder);
router.get('/me', verifyToken, getMyOrders);
router.get('/', verifyToken, isAdmin, getAllOrders);
router.get('/:id', verifyToken, isAdmin, getOrderById);
router.put('/:id/status', verifyToken, isAdmin, updateOrderStatus);

module.exports = router;