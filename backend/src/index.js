const app = require('./app');
const config = require('./config');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Start server
const server = app.listen(config.port, config.host, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🌟 MindConnect Backend Server                              ║
║                                                               ║
║   Environment: ${config.env.padEnd(46)}║
║   Server URL:  http://${config.host}:${config.port}${' '.repeat(35 - config.host.length - config.port.toString().length)}║
║   API Docs:    http://${config.host}:${config.port}/api-docs${' '.repeat(25 - config.host.length - config.port.toString().length)}║
║                                                               ║
║   Status: ✅ Server is running                               ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close(() => {
    console.log('✅ HTTP server closed');

    // Close database connections, etc.
    // TODO: Add cleanup logic here

    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
