const app = require('./src/app');
const env = require('./src/config/env');
const { connectDatabase, prisma } = require('./src/config/database');
const { connectRedis, redis } = require('./src/config/redis');
const logger = require('./src/utils/logger');

let server;

async function start() {
  await connectDatabase();
  await connectRedis();
  server = app.listen(env.PORT, () => logger.info(`URL Shortener API listening at ${env.BASE_URL}`));
}

async function shutdown(signal) {
  logger.info(`${signal} received; shutting down`);
  if (server) await new Promise((resolve) => server.close(resolve));
  await prisma.$disconnect();
  if (redis.status !== 'end') await redis.quit().catch(() => {});
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
start().catch(async (error) => {
  logger.error(`Startup failed: ${error.stack || error.message}`);
  await prisma.$disconnect();
  process.exit(1);
});
