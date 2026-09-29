const logger = require('../utils/logger');

module.exports = (error, req, res, next) => {
  if (res.headersSent) return next(error);
  let status = error.statusCode || 500;
  let code = error.code || 'INTERNAL_ERROR';
  let message = error.isOperational ? error.message : 'An unexpected error occurred';

  if (error.code === 'P2002') { status = 409; code = 'ALIAS_TAKEN'; message = 'That short code is already in use'; }
  if (status >= 500) logger.error(`${req.method} ${req.originalUrl}: ${error.stack || error.message}`);
  else logger.warn(`${req.method} ${req.originalUrl}: ${message}`);

  res.status(status).json({ error: { code, message } });
};
