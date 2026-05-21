const express = require('express');
const { UTApi } = require('uploadthing/server');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();
const utapi = new UTApi();

router.get('/admin/access', verifyToken, isAdmin, (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Admin upload access granted',
    user: req.user,
  });
});

router.get('/files', verifyToken, isAdmin, async (req, res, next) => {
  try {
    const files = await utapi.listFiles();

    return res.status(200).json({
      success: true,
      message: 'UploadThing files fetched successfully',
      data: files,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;