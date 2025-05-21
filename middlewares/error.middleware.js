// middlewares/error.middleware.js
exports.errorHandler = (err, req, res, next) => {
  // TODO: Implement error handling logic
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
};
