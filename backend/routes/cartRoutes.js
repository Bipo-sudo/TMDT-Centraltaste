const express = require('express');
const { verifyToken } = require('../middlewares/authMiddleware');
const { getCart, addToCart, updateCartItem, deleteCartItem } = require('../controllers/cartController');

const router = express.Router();

router.get('/', verifyToken, getCart);
router.post('/', verifyToken, addToCart);
router.put('/:cart_item_id', verifyToken, updateCartItem);
router.delete('/:cart_item_id', verifyToken, deleteCartItem);

module.exports = router;