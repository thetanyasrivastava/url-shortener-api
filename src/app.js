const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const env = require('./config/env');
const urlRoutes = require('./routes/urlRoutes');
const urlController = require('./controllers/urlController');
const asyncHandler = require('./utils/asyncHandler');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./utils/logger');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '16kb' }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(rateLimit({ windowMs: env.RATE_LIMIT_WINDOW_MS, limit: env.RATE_LIMIT_MAX, standardHeaders: 'draft-8', legacyHeaders: false }));

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use('/api/v1/urls', urlRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(require('./utils/openapi')));
// Redirect lives at the root so generated links are concise: /:code
app.get('/:code', asyncHandler(urlController.redirect));
app.use(notFound);
app.use(errorHandler);

module.exports = app;
