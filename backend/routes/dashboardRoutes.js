const express = require('express');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const { getDashboardStats } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/', verifyToken, isAdmin, getDashboardStats);

module.exports = router;