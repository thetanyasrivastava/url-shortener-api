module.exports = {
  openapi: '3.0.3',
  info: { title: 'URL Shortener API', version: '1.0.0', description: 'Create, inspect, and redirect short URLs.' },
  servers: [{ url: '/' }],
  paths: {
    '/api/v1/urls': {
      post: { summary: 'Create a short URL', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['url'], properties: { url: { type: 'string', format: 'uri' }, alias: { type: 'string', minLength: 3, maxLength: 64 }, expiresAt: { type: 'string', format: 'date-time' } } } } } }, responses: { 201: { description: 'Short URL created' }, 400: { description: 'Validation error' }, 409: { description: 'Alias already used' } } },
      get: { summary: 'List short URLs', parameters: [{ in: 'query', name: 'page', schema: { type: 'integer', default: 1 } }, { in: 'query', name: 'limit', schema: { type: 'integer', default: 20, maximum: 100 } }], responses: { 200: { description: 'Paginated URL list' } } }
    },
    '/api/v1/urls/{code}': { get: { summary: 'Get URL details and click count', parameters: [{ in: 'path', name: 'code', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'URL details' }, 404: { description: 'Not found' } } } },
    '/{code}': { get: { summary: 'Redirect to the original URL', parameters: [{ in: 'path', name: 'code', required: true, schema: { type: 'string' } }], responses: { 302: { description: 'Redirect' }, 410: { description: 'Expired URL' } } } },
    '/health': { get: { summary: 'Health check', responses: { 200: { description: 'Service is healthy' } } } }
  }
};
