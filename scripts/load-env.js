// Load .env.local for development
const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(__dirname, '..', '.env.local');

if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, 'utf8');
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const [key, ...valueParts] = trimmed.split('=');
    if (key) {
      const value = valueParts.join('=').trim();
      // Remove quotes if present
      const cleanValue = value.replace(/^["']|["']$/g, '');
      process.env[key] = cleanValue;
    }
  }
}
