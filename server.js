import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.VITE_BACKEND_URL || 'https://navmanch-backend.onrender.com';

// Helper to detect if request is from a crawler/bot
const isCrawler = (userAgent) => {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return /facebookexternalhit|whatsapp|twitterbot|linkedinbot|slackbot|telegrambot|applebot|bingbot|googlebot|baiduspider|yandex|sogou|duckduckbot|embedly|quora|showyoubot|outbrain|pinterest|vkShare|W3C_Validator/i.test(ua);
};

// Middleware to proxy crawler requests to backend for meta tags
app.use((req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  
  // Only proxy crawler requests for news and epaper routes
  if (isCrawler(userAgent) && (req.path.startsWith('/news/') || req.path.startsWith('/epaper/'))) {
    const backendPath = req.path + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '');
    const backendFullUrl = `${BACKEND_URL}${backendPath}`;
    
    console.log(`Proxying crawler request: ${req.path} -> ${backendFullUrl}`);
    
    // Fetch from backend and return HTML
    fetch(backendFullUrl, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Backend responded with ${response.status}`);
        }
        return response.text();
      })
      .then(html => {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
      })
      .catch(error => {
        console.error('Error proxying to backend:', error);
        // Fall through to serve React app if backend fails
        next();
      });
  } else {
    // Not a crawler or not a route that needs meta tags - serve React app
    next();
  }
});

// Serve static files from dist directory
app.use(express.static(join(__dirname, 'dist')));

// Serve index.html for all other routes (React Router)
app.get('*', (req, res) => {
  try {
    const indexPath = join(__dirname, 'dist', 'index.html');
    const indexHtml = readFileSync(indexPath, 'utf-8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(indexHtml);
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).send('Error loading page');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Backend URL: ${BACKEND_URL}`);
});

