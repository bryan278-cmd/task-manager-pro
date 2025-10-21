#!/usr/bin/env node

import { createRequire } from 'module';
import { exec } from 'child_process';
import { promisify } from 'util';

const require = createRequire(import.meta.url);
const execPromise = promisify(exec);

// Get port from command line argument or default to 3000
const port = process.argv[2] || '3000';

async function freePort() {
  try {
    if (process.platform === 'win32') {
      // Windows implementation
      console.log(`🔍 Checking for processes on port ${port} (Windows)...`);
      
      const { stdout } = await execPromise(`netstat -ano | findstr :${port}`, { windowsHide: true });
      
      if (!stdout) {
        console.log(`✅ No processes found on port ${port}`);
        return;
      }

      const lines = stdout.trim().split('\n');
      const pids = new Set();

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          const pid = parts[parts.length - 1];
          if (pid !== '0') {
            pids.add(pid);
          }
        }
      }

      if (pids.size === 0) {
        console.log(`✅ No processes found on port ${port}`);
        return;
      }

      for (const pid of pids) {
        try {
          await execPromise(`taskkill /PID ${pid} /F`, { windowsHide: true });
          console.log(`✅ Killed process PID ${pid} on port ${port}`);
        } catch (error) {
          console.log(`⚠️  Failed to kill process PID ${pid}: ${error.message}`);
        }
      }
    } else {
      // macOS/Linux implementation
      console.log(`🔍 Checking for processes on port ${port} (Unix)...`);
      
      try {
        const { stdout } = await execPromise(`lsof -t -i:${port}`, { windowsHide: true });
        
        if (!stdout) {
          console.log(`✅ No processes found on port ${port}`);
          return;
        }

        const pids = stdout.trim().split('\n').filter(pid => pid);
        
        if (pids.length === 0) {
          console.log(`✅ No processes found on port ${port}`);
          return;
        }

        for (const pid of pids) {
          try {
            await execPromise(`kill -9 ${pid}`, { windowsHide: true });
            console.log(`✅ Killed process PID ${pid} on port ${port}`);
          } catch (error) {
            console.log(`⚠️  Failed to kill process PID ${pid}: ${error.message}`);
          }
        }
      } catch (error) {
        if (error.message.includes('lsof: command not found')) {
          console.log('⚠️  lsof command not found. Install it with: brew install lsof');
        } else {
          console.log(`✅ No processes found on port ${port} (${error.message})`);
        }
      }
    }
  } catch (error) {
    if (error.message.includes('findstr')) {
      console.log(`✅ No processes found on port ${port}`);
    } else {
      console.error('❌ Error freeing port:', error.message);
      process.exit(1);
    }
  }
}

freePort();
