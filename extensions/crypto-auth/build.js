#!/usr/bin/env node

/**
 * Simple build script for the cryptographic authentication extension
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('Building Cryptographic Authentication Extension...\n');

try {
  // Check if TypeScript is installed
  console.log('1. Checking dependencies...');
  execSync('npm list typescript', { stdio: 'inherit' });
  
  // Compile TypeScript
  console.log('\n2. Compiling TypeScript...');
  execSync('npx tsc', { stdio: 'inherit' });
  
  // Run tests
  console.log('\n3. Running tests...');
  execSync('npm test', { stdio: 'inherit' });
  
  // Create distribution package
  console.log('\n4. Creating distribution package...');
  
  // Copy package.json to dist
  const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));
  
  // Update paths for distribution
  const distPackageJson = {
    ...packageJson,
    main: './index.js',
    types: './index.d.ts',
    scripts: {
      ...packageJson.scripts,
      prepublishOnly: 'npm run build'
    },
    files: ['**/*.js', '**/*.d.ts', 'README.md']
  };
  
  writeFileSync(
    join(__dirname, 'dist', 'package.json'),
    JSON.stringify(distPackageJson, null, 2)
  );
  
  // Copy README
  execSync(`cp ${join(__dirname, 'README.md')} ${join(__dirname, 'dist', 'README.md')}`);
  
  console.log('\n✅ Build completed successfully!');
  console.log('Distribution ready in: dist/');
  
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}
