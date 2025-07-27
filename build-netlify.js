#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';

console.log('🚀 Building for Netlify deployment...');

try {
  // Build frontend
  console.log('📦 Building frontend...');
  execSync('vite build', { stdio: 'inherit' });

  // Ensure netlify/functions directory exists
  if (!existsSync('netlify/functions')) {
    mkdirSync('netlify/functions', { recursive: true });
  }

  // Build Netlify function
  console.log('⚡ Building Netlify functions...');
  execSync(
    'esbuild netlify/functions/api.ts --platform=node --packages=external --bundle --format=esm --outdir=netlify/functions --target=node18 --out-extension:.js=.mjs',
    { stdio: 'inherit' }
  );

  console.log('✅ Build completed successfully!');
  console.log('📁 Frontend built to: dist/');
  console.log('🔧 Functions built to: netlify/functions/');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}