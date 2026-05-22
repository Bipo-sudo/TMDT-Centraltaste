const express = require('express');
const { verifyToken } = require('../middlewares/authMiddleware');
const { createOrder, getMyOrders } = require('../controllers/orderController');

const router = express.Router();

router.post('/', verifyToken, createOrder);
router.post('/checkout', verifyToken, createOrder);
router.get('/me', verifyToken, getMyOrders);

module.exports = router;