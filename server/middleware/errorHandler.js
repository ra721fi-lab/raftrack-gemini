const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler] Uncaught Exception:', err.stack || err.message || err);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Terjadi kesalahan sistem internal. Harap hubungi administrator.',
    // Sembunyikan stack trace pada lingkungan production untuk keamanan
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = { errorHandler };
