function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  const errorDetail = err.error || err.stack || 'Unexpected server error';

  return res.status(statusCode).json({
    success: false,
    message,
    error: errorDetail,
  });
}

module.exports = errorHandler;