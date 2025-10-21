#!/usr/bin/env node

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const http = require('http');

// Configuration
const PORT = process.env.APP_PORT || '3000';
const BASE_URL = `http://localhost:${PORT}`;

// Test endpoints
const endpoints = [
  '/',
  '/api/auth/session',
  '/api/auth/signin',
  '/api/auth/signout',
  '/login',
  '/register'
];

console.log('🔍 Running smoke test...');
console.log(`📍 Base URL: ${BASE_URL}`);
console.log('\n📋 Status Codes:');
console.log('==================');

async function testEndpoint(path) {
  return new Promise((resolve) => {
    const req = http.get(`${BASE_URL}${path}`, (res) => {
      resolve({ path, statusCode: res.statusCode });
    });
    
    req.on('error', () => {
      resolve({ path, statusCode: 'ERR' });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ path, statusCode: 'TIMEOUT' });
    });
  });
}

async function runTests() {
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
  }
  
  // Display results in a compact table
  results.forEach(({ path, statusCode }) => {
    console.log(`${path.padEnd(25)} ${statusCode}`);
  });
  
  console.log('\n✅ Smoke test completed');
}

runTests().catch((error) => {
  console.error('❌ Smoke test failed:', error);
  process.exit(1);
});
