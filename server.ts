import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const PORT = process.env.PORT || 3000;

// Determine dist path robustly in both dev (tsx) and production (esbuild CJS bundle)
const __filename = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
const __dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(__filename);

const distPath = fsCheckDistPath();

function fsCheckDistPath() {
  const candidates = [
    path.join(__dirname),
    path.join(process.cwd(), 'dist'),
    path.join(__dirname, '..', 'dist'),
    path.resolve(process.cwd(), 'dist')
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(path.join(p, 'index.html'))) {
        console.log(`[Server] Found valid dist folder at: ${p}`);
        return p;
      }
    } catch (e) {
      console.error(`[Server] Error checking candidate path ${p}:`, e);
    }
  }
  const fallback = path.join(process.cwd(), 'dist');
  console.warn(`[Server] Warning: index.html not found in candidates. Defaulting to: ${fallback}`);
  return fallback;
}

// Prevent serving server.cjs directly
app.use((req, res, next) => {
  if (req.path.endsWith('.cjs') || req.path.endsWith('.cjs.map')) {
    return res.status(403).send('Access forbidden');
  }
  next();
});

// Serve static assets from the built Vite dist directory
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, {
    index: false,
    maxAge: '1d'
  }));
} else {
  console.error(`[Server] CRITICAL: Static directory does not exist at ${distPath}. App may fail to load frontend.`);
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  const indexExists = fs.existsSync(path.join(distPath, 'index.html'));
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    distPath,
    indexExists
  });
});

// AI Chat endpoint using @google/genai
app.post('/api/ai-chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages array' });
    }

    const contents = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: 'You are EDGEX AI Assistant, a friendly and knowledgeable luxury streetwear footwear expert for EDGEX Footwear. You help customers with sizing, product details (Apex Vol. 1, Strata Void, Titan Shift, Core Minimal, Concrete Spec X, Obsidian Prime, Metro Glide, Chrono Casual, Avant Garde One), shipping info, care guides, promo codes (EDGEX10, STEEP10, EDGE20, EDGEX15), and order tracking. Keep answers concise, helpful, and stylish.',
      }
    });

    const reply = response.text || 'I am here to help you with EDGEX sneakers, sizing, and orders!';
    res.json({ reply });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate AI response' });
  }
});

// Single Page Application (SPA) fallback: serve index.html for all other non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }

  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  } else {
    console.error(`[Server] index.html not found at ${indexPath}`);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Application Starting / Build Required</title>
          <style>
            body { font-family: sans-serif; background: #111; color: #fff; padding: 40px; text-align: center; }
            .box { max-width: 600px; margin: 0 auto; background: #222; padding: 30px; border-radius: 12px; border: 1px solid #444; }
            h1 { color: #ff6b6b; }
            p { color: #ccc; line-height: 1.6; }
            code { background: #333; padding: 2px 6px; border-radius: 4px; color: #4ade80; }
          </style>
        </head>
        <body>
          <div class="box">
            <h1>Application Build Required</h1>
            <p>The frontend static assets (<code>dist/index.html</code>) were not found at <code>${indexPath}</code>.</p>
            <p>If deploying on Render, ensure your <strong>Build Command</strong> is set to <code>npm install && npm run build</code> and your <strong>Start Command</strong> is set to <code>npm start</code>.</p>
            <button onclick="window.location.reload()" style="margin-top:20px; padding:10px 20px; background:#D10000; color:#fff; border:none; border-radius:6px; cursor:pointer;">Retry</button>
          </div>
        </body>
      </html>
    `);
  }
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'production'} mode (dist: ${distPath})`);
});



