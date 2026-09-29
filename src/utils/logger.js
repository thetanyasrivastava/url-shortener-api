const fs = require('node:fs');
const path = require('node:path');

const logDir = path.join(process.cwd(), 'logs');
fs.mkdirSync(logDir, { recursive: true });
const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const configuredLevel = process.env.LOG_LEVEL || 'info';

function write(level, message) {
  if (levels[level] > (levels[configuredLevel] ?? 2)) return;
  const line = `${new Date().toISOString()} [${level.toUpperCase()}] ${message}`;
  const stream = level === 'error' ? console.error : console.log;
  stream(line);
  fs.appendFile(path.join(logDir, 'app.log'), `${line}\n`, () => {});
}

module.exports = Object.fromEntries(Object.keys(levels).map((level) => [level, (message) => write(level, message)]));
