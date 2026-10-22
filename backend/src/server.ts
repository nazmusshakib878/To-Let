import { app } from './app';
import { config } from './config/env';

const server = app.listen(config.port, () => {
  console.log(`===============================================`);
  console.log(`🚀 বাসা খুঁজি (To-Let) API Server is running!`);
  console.log(`📡 URL: http://localhost:${config.port}`);
  console.log(`🩺 Health: http://localhost:${config.port}/api/health`);
  console.log(`📁 Uploads: ${config.uploadDir}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`===============================================`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Gracefully shutting down server...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down server...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});
