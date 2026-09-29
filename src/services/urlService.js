const { prisma } = require('../config/database');
const { redis, isRedisReady } = require('../config/redis');
const env = require('../config/env');
const { generateShortCode } = require('../utils/shortCode');
const AppError = require('../utils/appError');

const CACHE_PREFIX = 'short-url:';
const CACHE_TTL_SECONDS = 3600;

async function cachedLongUrl(code) {
  if (!isRedisReady()) return null;
  try { return await redis.get(`${CACHE_PREFIX}${code}`); } catch { return null; }
}

async function cacheLongUrl(code, longUrl, expiresAt) {
  if (!isRedisReady()) return;
  try {
    const ttl = expiresAt ? Math.min(CACHE_TTL_SECONDS, Math.floor((expiresAt.getTime() - Date.now()) / 1000)) : CACHE_TTL_SECONDS;
    if (ttl > 0) await redis.set(`${CACHE_PREFIX}${code}`, longUrl, 'EX', ttl);
  } catch { /* Cache failures never interrupt the request. */ }
}

async function createShortUrl({ url, alias, expiresAt }) {
  let code = alias;
  if (!code) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const candidate = generateShortCode();
      const exists = await prisma.shortUrl.findUnique({ where: { code: candidate }, select: { id: true } });
      if (!exists) { code = candidate; break; }
    }
    if (!code) throw new AppError('Could not generate a unique short code; try again', 503, 'CODE_GENERATION_FAILED');
  }

  const record = await prisma.shortUrl.create({
    data: { code, longUrl: url, expiresAt: expiresAt ? new Date(expiresAt) : null }
  });
  await cacheLongUrl(code, record.longUrl, record.expiresAt);
  return serialize(record);
}

async function resolveShortUrl(code) {
  const cached = await cachedLongUrl(code);
  if (cached) {
    // Keep click counts authoritative in PostgreSQL even on cache hits.
    const updated = await prisma.shortUrl.updateMany({ where: { code, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }, data: { clicks: { increment: 1 } } });
    if (updated.count === 1) return cached;
    if (isRedisReady()) await redis.del(`${CACHE_PREFIX}${code}`).catch(() => {});
  }

  const now = new Date();
  const record = await prisma.shortUrl.findUnique({ where: { code } });
  if (!record) throw new AppError('Short URL not found', 404, 'SHORT_URL_NOT_FOUND');
  if (record.expiresAt && record.expiresAt <= now) throw new AppError('This short URL has expired', 410, 'SHORT_URL_EXPIRED');
  await prisma.shortUrl.update({ where: { code }, data: { clicks: { increment: 1 } } });
  await cacheLongUrl(code, record.longUrl, record.expiresAt);
  return record.longUrl;
}

async function getUrl(code) {
  const record = await prisma.shortUrl.findUnique({ where: { code } });
  if (!record) throw new AppError('Short URL not found', 404, 'SHORT_URL_NOT_FOUND');
  return serialize(record);
}

async function listUrls({ page, limit }) {
  const where = {};
  const [items, total] = await prisma.$transaction([
    prisma.shortUrl.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.shortUrl.count({ where })
  ]);
  return { items: items.map(serialize), pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

function serialize(record) {
  return {
    code: record.code,
    shortUrl: `${env.BASE_URL.replace(/\/$/, '')}/${record.code}`,
    url: record.longUrl,
    expiresAt: record.expiresAt,
    clicks: record.clicks,
    createdAt: record.createdAt
  };
}

module.exports = { createShortUrl, resolveShortUrl, getUrl, listUrls };
