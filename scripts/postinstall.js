#!/usr/bin/env node
/**
 * Smart postinstall lifecycle script.
 * 
 * Prevents Vercel frontend deployments from failing when backend Prisma dependencies
 * are not installed, while preserving automatic Prisma Client generation for local
 * full-stack development and backend deployments.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Detect Vercel or frontend-focused deployment environments
const isVercel = Boolean(
  process.env.VERCEL ||
  process.env.NOW_BUILDER ||
  process.env.VERCEL_ENV ||
  process.env.NETLIFY ||
  process.env.CF_PAGES
);

const isSkipPrisma = Boolean(
  process.env.SKIP_PRISMA_GENERATE === 'true' ||
  process.env.SKIP_PRISMA_GENERATE === '1' ||
  process.env.SKIP_POSTINSTALL === 'true' ||
  process.env.SKIP_POSTINSTALL === '1'
);

// Check if install was targeted at frontend workspace
const initCwd = (process.env.INIT_CWD || '').replace(/[\\/]+$/, '');
const isFrontendTarget = Boolean(
  process.env.npm_config_workspace === 'frontend' ||
  process.env.npm_config_workspace === 'tolet-frontend' ||
  process.cwd().endsWith('frontend') ||
  initCwd.endsWith('frontend')
);

if (isVercel || isSkipPrisma || isFrontendTarget) {
  console.log('⚡ Vercel / frontend deployment detected. Skipping backend Prisma generation.');
  process.exit(0);
}

// 2. Check if backend schema exists
const rootDir = path.resolve(__dirname, '..');
const schemaPath = path.join(rootDir, 'backend', 'prisma', 'schema.prisma');

if (!fs.existsSync(schemaPath)) {
  console.log('ℹ️ backend/prisma/schema.prisma not found. Skipping Prisma generation.');
  process.exit(0);
}

// 3. Verify Prisma CLI or @prisma/client is installed before executing
const rootNodeModules = path.join(rootDir, 'node_modules');
const backendNodeModules = path.join(rootDir, 'backend', 'node_modules');
const hasPrismaPkg = fs.existsSync(path.join(rootNodeModules, 'prisma')) ||
                     fs.existsSync(path.join(backendNodeModules, 'prisma'));
const hasPrismaBin = fs.existsSync(path.join(rootNodeModules, '.bin', 'prisma')) ||
                     fs.existsSync(path.join(rootNodeModules, '.bin', 'prisma.cmd')) ||
                     fs.existsSync(path.join(backendNodeModules, '.bin', 'prisma')) ||
                     fs.existsSync(path.join(backendNodeModules, '.bin', 'prisma.cmd'));

if (!hasPrismaPkg && !hasPrismaBin) {
  console.log('ℹ️ Prisma CLI is not installed in current environment. Skipping Prisma generation.');
  process.exit(0);
}

// 4. Attempt Prisma client generation safely
try {
  console.log('🔄 Generating Prisma Client for backend...');
  const backendDir = path.join(rootDir, 'backend');
  try {
    execSync('npx prisma generate', {
      cwd: backendDir,
      stdio: 'inherit',
      env: process.env,
    });
  } catch (innerErr) {
    execSync('npm --workspace=backend run prisma:generate', {
      cwd: rootDir,
      stdio: 'inherit',
      env: process.env,
    });
  }
  console.log('✅ Prisma Client generation completed.');
} catch (err) {
  // If Prisma generation encounters an issue (e.g. Windows query_engine lock EPERM or missing CLI on frontend-only host),
  // warn gracefully without aborting npm install.
  console.warn('⚠️ Notice: Prisma generation could not complete during postinstall:');
  console.warn(err.message || String(err));
  console.warn('👉 Note: You can run `npm --workspace=backend run prisma:generate` manually when needed.');
  process.exit(0);
}
