export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const debugInfo = {
      environment: process.env.NODE_ENV,
      platform: process.platform,
      nodeVersion: process.version,
      cwd: process.cwd(),
      tmpDir: '/tmp',
      timestamp: new Date().toISOString()
    };

    // Check if /tmp directory exists and is writable
    try {
      await fs.promises.access('/tmp', fs.constants.F_OK | fs.constants.W_OK);
      debugInfo.tmpAccessible = true;
    } catch (error) {
      debugInfo.tmpAccessible = false;
      debugInfo.tmpError = error.message;
    }

    // Check for existing files
    try {
      const rulesPath = '/tmp/rules.json';
      const processedPath = '/tmp/processed_data.json';
      
      const rulesExists = await fs.promises.access(rulesPath).then(() => true).catch(() => false);
      const processedExists = await fs.promises.access(processedPath).then(() => true).catch(() => false);
      
      debugInfo.files = {
        rulesExists,
        processedExists
      };

      if (rulesExists) {
        const rulesContent = await fs.promises.readFile(rulesPath, 'utf8');
        debugInfo.rulesContent = JSON.parse(rulesContent);
      }

      if (processedExists) {
        const processedContent = await fs.promises.readFile(processedPath, 'utf8');
        debugInfo.processedContent = JSON.parse(processedContent);
      }
    } catch (error) {
      debugInfo.fileError = error.message;
    }

    // Try to write a test file
    try {
      const testPath = '/tmp/test.json';
      await fs.promises.writeFile(testPath, JSON.stringify({ test: true }));
      debugInfo.canWrite = true;
      
      // Clean up test file
      await fs.promises.unlink(testPath);
    } catch (error) {
      debugInfo.canWrite = false;
      debugInfo.writeError = error.message;
    }

    return res.status(200).json(debugInfo);
  } catch (error) {
    return res.status(500).json({ 
      error: 'Debug failed', 
      details: error.message,
      stack: error.stack 
    });
  }
}