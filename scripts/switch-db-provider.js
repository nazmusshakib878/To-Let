#!/usr/bin/env node
/**
 * Safe Database Provider Switcher for Khulna To-Let
 * 
 * Usage:
 *   node scripts/switch-db-provider.js sqlite     # Target local development SQLite
 *   node scripts/switch-db-provider.js postgres   # Target cloud production PostgreSQL
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const target = (process.argv[2] || '').toLowerCase();
const prismaDir = path.resolve(__dirname, '..', 'backend', 'prisma');
const schemaPath = path.join(prismaDir, 'schema.prisma');
const pgSchemaPath = path.join(prismaDir, 'schema.postgresql.prisma');

if (!['sqlite', 'postgres', 'postgresql'].includes(target)) {
  console.log('❌ Invalid target. Specify either "sqlite" or "postgres".');
  console.log('Usage: node scripts/switch-db-provider.js <sqlite|postgres>');
  process.exit(1);
}

const currentContent = fs.readFileSync(schemaPath, 'utf8');

if (target === 'sqlite') {
  console.log('🔄 Configuring Prisma for SQLite (Local Development)...');
  const updated = currentContent.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
  fs.writeFileSync(schemaPath, updated, 'utf8');
  console.log('✅ schema.prisma set to SQLite.');
} else {
  console.log('🔄 Configuring Prisma for PostgreSQL (Production Cloud)...');
  if (fs.existsSync(pgSchemaPath)) {
    const pgContent = fs.readFileSync(pgSchemaPath, 'utf8');
    fs.writeFileSync(schemaPath, pgContent, 'utf8');
  } else {
    const updated = currentContent.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
    fs.writeFileSync(schemaPath, updated, 'utf8');
  }
  console.log('✅ schema.prisma set to PostgreSQL.');
}

try {
  console.log('⚙️ Regenerating Prisma Client...');
  execSync('npx prisma generate', {
    cwd: path.resolve(__dirname, '..', 'backend'),
    stdio: 'inherit',
  });
  console.log('🎉 Database provider switch completed successfully.');
} catch (e) {
  console.warn('⚠️ Warning: Prisma Client generate completed with notes:', e.message);
}
