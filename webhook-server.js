#!/usr/bin/env node

/**
 * Local Webhook Server
 * 
 * Receives webhook notifications from GitHub when design tokens are updated
 * and automatically pulls the latest changes to your local development environment
 */

const express = require('express');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'figma-tokens-webhook'
  });
});

// Main webhook endpoint
app.post('/figma-webhook', async (req, res) => {
  try {
    console.log('🎨 Received Figma tokens webhook');
    console.log('Payload:', JSON.stringify(req.body, null, 2));

    const { event, repository, commit, timestamp } = req.body;

    if (event !== 'tokens_updated') {
      console.log('ℹ️ Ignoring non-tokens event:', event);
      return res.status(200).json({ message: 'Event ignored' });
    }

    console.log(`🔄 Processing tokens update for ${repository} (${commit})`);

    // Pull latest changes
    await executeCommand('git pull origin main');
    
    // Regenerate Swift files
    await executeCommand('cd scripts && npm run generate-swift');
    
    console.log('✅ Design tokens updated successfully');
    
    res.status(200).json({ 
      success: true, 
      message: 'Tokens updated successfully',
      repository,
      commit,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Webhook processing failed:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Execute shell command with promise
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Command failed: ${command}`);
        console.error('Error:', error.message);
        console.error('Stderr:', stderr);
        reject(error);
        return;
      }
      
      console.log(`✅ Command succeeded: ${command}`);
      if (stdout.trim()) {
        console.log('Output:', stdout.trim());
      }
      resolve(stdout);
    });
  });
}

// Start server
app.listen(PORT, () => {
  console.log('🚀 Figma Tokens Webhook Server Started');
  console.log(`📡 Listening on port ${PORT}`);
  console.log(`🔗 Webhook URL: http://localhost:${PORT}/figma-webhook`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Expose this server to the internet (use ngrok or similar)');
  console.log('2. Add webhook URL to your GitHub repository settings');
  console.log('3. Test by updating tokens in Figma plugin');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down webhook server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down webhook server...');
  process.exit(0);
});
