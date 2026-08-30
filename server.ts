import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

// Determine dist path robustly in both dev (tsx) and production (esbuild CJS bundle)
const __filename = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
const __dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(__filename);

const distPath = fsCheckDistPath();

function fsCheckDistPath() {
  const candidates = [
    path.join(__dirname),
    path.join(process.cwd(), 'dist'),
    path.join(__dirname, '..', 'dist')
  ];
  for (const p of candidates) {
    try {
      const fs = require('fs');
      if (fs.existsSync(path.join(p, 'index.html'))) {
        return p;
      }
    } catch {}
  }
  return path.join(process.cwd(), 'dist');
}

// Prevent serving server.cjs directly
app.use((req, res, next) => {
  if (req.path.endsWith('.cjs') || req.path.endsWith('.cjs.map')) {
    return res.status(403).send('Access forbidden');
  }
  next();
});

// Serve static assets from the built Vite dist directory
app.use(express.static(distPath, {
  index: false,
  maxAge: '1d'
}));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Single Page Application (SPA) fallback: serve index.html for all other non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'production'} mode (dist: ${distPath})`);
});


