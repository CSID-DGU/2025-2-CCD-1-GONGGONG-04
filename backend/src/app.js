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
const recommendationRoutes = require('./routes/recommendation.routes');
const selfAssessmentRoutes = require('./routes/selfAssessment.routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors(config.cors));

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
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
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
        url: `http://localhost:${config.port}${config.api.prefix}`,
        description: 'Development server',
      },
      {
        url: `http://localhost:${config.port}`,
        description: 'Base server',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check routes (outside API prefix)
app.use('/', healthRoutes);

// API routes
app.get(config.api.prefix, (req, res) => {
  res.json({
    message: 'MindConnect API',
    version: '1.0.0',
    documentation: '/api-docs',
  });
});

// Centers routes
app.use(`${config.api.prefix}/centers`, centersRoutes);

// Reviews routes
app.use(config.api.prefix, reviewsRoutes);

// Recommendation routes
app.use(`${config.api.prefix}/recommendations`, recommendationRoutes);

// Self-Assessment routes
app.use(`${config.api.prefix}/self-assessments`, selfAssessmentRoutes);

// TODO: Add more API routes here
// app.use(`${config.api.prefix}/auth`, authRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

module.exports = app;
