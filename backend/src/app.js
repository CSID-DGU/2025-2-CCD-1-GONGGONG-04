// Sentry must be imported and initialized first
require('ts-node/register');
const { initSentry, Sentry } = require('./config/sentry');

// Initialize Sentry before anything else
initSentry();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const config = require('./config');
const healthRoutes = require('./routes/health.routes');
const centersRoutes = require('./routes/centers.routes');
const reviewsRoutes = require('./routes/reviews.routes');
// Import TypeScript routes file explicitly (Sprint 2)
const recommendationRoutes = require('./routes/recommendation.routes.ts').default;
const selfAssessmentRoutes = require('./routes/selfAssessment.routes');
// Sprint 3: Assessment routes
const assessmentRoutes = require('./routes/assessment.routes');
// Sprint 5 (Phase 2): Hybrid Recommendation routes
const hybridRecommendationRoutes = require('./routes/hybridRecommendation.routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

// Initialize Express app
const app = express();

// BigInt JSON serialization support
// Convert BigInt to Number when serializing to JSON
BigInt.prototype.toJSON = function() {
  return Number(this);
};

// Sentry request handler (must be first middleware)
if (Sentry && Sentry.Handlers) {
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors(
    config.cors || {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
    },
  ),
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit?.windowMs || 900000,
  max: config.rateLimit?.maxRequests || 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Swagger documentation configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MindConnect API',
      version: '1.0.0',
      description: '마음이음 (MindConnect) - 정신건강 관련 공공기관 통합 검색 및 추천 플랫폼 API',
      contact: {
        name: 'MindConnect Team',
        email: 'contact@mindconnect.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port || 8080}${config.api?.prefix || '/api/v1'}`,
        description: 'Development server',
      },
      {
        url: `http://localhost:${config.port || 8080}`,
        description: 'Base server',
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check routes (outside API prefix)
app.use('/', healthRoutes);

// API routes
const apiPrefix = config.api?.prefix || '/api/v1';

app.get(apiPrefix, (req, res) => {
  res.json({
    message: 'MindConnect API',
    version: '1.0.0',
    documentation: '/api-docs',
  });
});

// Centers routes
app.use(`${apiPrefix}/centers`, centersRoutes);

// Reviews routes
app.use(apiPrefix, reviewsRoutes);

// Recommendation routes
app.use(`${apiPrefix}/recommendations`, recommendationRoutes);

// Self-Assessment routes (Sprint 1 - Legacy)
app.use(`${apiPrefix}/self-assessments`, selfAssessmentRoutes);

// Assessment routes (Sprint 3 - New API)
app.use(`${apiPrefix}/assessments`, assessmentRoutes);

// Sprint 5 (Phase 2): Hybrid Recommendation routes
app.use('/api/v2/recommendations', hybridRecommendationRoutes);

// TODO: Add more API routes here
// app.use(`${config.api.prefix}/auth`, authRoutes);

// 404 handler
app.use(notFoundHandler);

// Sentry error handler (must be before other error handlers)
if (Sentry && Sentry.Handlers) {
  app.use(Sentry.Handlers.errorHandler());
}

// Global error handler
app.use(errorHandler);

module.exports = app;
