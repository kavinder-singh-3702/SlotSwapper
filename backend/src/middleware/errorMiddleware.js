/**
 * Express error-handling middleware that ensures a consistent JSON response.
 * The stack trace is only returned in non-production environments for easier debugging.
 */
export const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || 500;
  const response = {
    message: err.message || 'Internal Server Error'
  };

  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
