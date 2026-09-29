const crypto = require('node:crypto');
const env = require('../config/env');

const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
function generateShortCode(length = env.SHORT_CODE_LENGTH) {
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
}

module.exports = { generateShortCode };
