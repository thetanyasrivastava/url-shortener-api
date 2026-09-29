const Redis = require('ioredis');
const env = require('./env');
const logger = require('../utils/logger');

const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy: (times) => times <= 3 ? Math.min(times * 250, 1000) : null,
  reconnectOnError: () => false
});

redis.on('error', (error) => logger.warn(`Redis unavailable; cache bypassed: ${error.message}`));

async function connectRedis() {
  try {
    await redis.connect();
    logger.info('Connected to Redis');
  } catch (error) {
    logger.warn(`Redis unavailable; continuing without cache: ${error.message}`);
  }
}

function isRedisReady() { return redis.status === 'ready'; }

module.exports = { redis, connectRedis, isRedisReady };
