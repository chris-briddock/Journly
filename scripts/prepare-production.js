#!/usr/bin/env node

/**
 * This script prepares the database for production deployment.
 * It runs the necessary Prisma commands to deploy migrations.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Function to execute shell commands
function exec(command) {
  try {
    console.log(`Executing: ${command}`);
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error);
    process.exit(1);
  }
}

// Main function
async function main() {
  console.log('Preparing database for production...');

  // Check if we're in a production environment
  const isProduction = process.env.NODE_ENV === 'production';
  console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);

  // Generate Prisma client
  exec('npx prisma generate');

  // If in production, deploy migrations
  if (isProduction) {
    console.log('Deploying migrations to production database...');
    exec('npx prisma migrate deploy');
  }

  console.log('Database preparation complete!');
}

// Run the main function
main().catch((error) => {
  console.error('Error preparing database for production:');
  console.error(error);
  process.exit(1);
});
