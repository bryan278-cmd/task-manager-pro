#!/usr/bin/env node

import { createRequire } from 'module';
import { promises as fs } from 'fs';
import { join } from 'path';

const require = createRequire(import.meta.url);

// Get port from command line argument or default to 3000
const port = process.argv[2] || '3000';
const envPath = join(process.cwd(), '.env');
const targetUrl = `http://localhost:${port}`;

async function setNextAuthUrl() {
  try {
    // Read existing .env file
    let envContent = '';
    try {
      envContent = await fs.readFile(envPath, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('.env file not found, creating new one');
      } else {
        throw error;
      }
    }

    // Split into lines
    const lines = envContent.split('\n');
    let nextAuthUrlFound = false;
    const newLines = [];

    // Process each line
    for (const line of lines) {
      if (line.startsWith('NEXTAUTH_URL=')) {
        nextAuthUrlFound = true;
        newLines.push(`NEXTAUTH_URL=${targetUrl}`);
      } else {
        newLines.push(line);
      }
    }

    // If NEXTAUTH_URL wasn't found, add it
    if (!nextAuthUrlFound) {
      newLines.push(`NEXTAUTH_URL=${targetUrl}`);
    }

    // Write back to file
    const newContent = newLines.filter(line => line !== '').join('\n') + '\n';
    await fs.writeFile(envPath, newContent, 'utf8');
    
    console.log(`✅ NEXTAUTH_URL set to ${targetUrl} in .env file`);
  } catch (error) {
    console.error('❌ Error setting NEXTAUTH_URL:', error.message);
    process.exit(1);
  }
}

setNextAuthUrl();
