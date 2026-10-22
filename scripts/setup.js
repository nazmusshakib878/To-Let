#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up বাসা খুঁজি (To-Let) Full-Stack Application...');

const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const uploadsDir = path.join(backendDir, 'uploads');
const envExamplePath = path.join(backendDir, '.env.example');
const envPath = path.join(backendDir, '.env');

// 1. Ensure backend .env exists
if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  console.log('📄 Creating backend .env from .env.example...');
  fs.copyFileSync(envExamplePath, envPath);
}

// 2. Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  console.log('📁 Creating uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 3. Setup SQLite database and run Prisma seed
try {
  console.log('🗄️ Initializing SQLite database schema...');
  execSync('npm --workspace=backend run db:setup', {
    cwd: rootDir,
    stdio: 'inherit',
    env: process.env,
  });
  console.log('✨ Setup completed successfully! You can now run: npm run dev');
} catch (error) {
  console.error('⚠️ Database setup encountered an error:', error.message);
  process.exit(1);
}
