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

// Serve robots.txt
app.get('/robots.txt', (req, res) => {
  try {
    const robotsPath = join(__dirname, 'dist', 'robots.txt');
    const robotsTxt = readFileSync(robotsPath, 'utf-8');
    res.setHeader('Content-Type', 'text/plain');
    res.send(robotsTxt);
  } catch (error) {
    // Fallback if robots.txt doesn't exist
    res.setHeader('Content-Type', 'text/plain');
    res.send(`User-agent: *
Allow: /

Sitemap: https://navmanchnews.com/sitemap.xml`);
  }
});

// Proxy sitemap request to backend (MUST be before static files)
app.get('/sitemap.xml', async (req, res) => {
  try {
    const backendUrl = BACKEND_URL || 'https://navmanch-backend.onrender.com';
    console.log(`Fetching sitemap from: ${backendUrl}/sitemap.xml`);
    
    const response = await fetch(`${backendUrl}/sitemap.xml`, {
      headers: {
        'Accept': 'application/xml, text/xml, */*',
      }
    });
    
    if (!response.ok) {
      console.error(`Backend responded with status: ${response.status}`);
      throw new Error(`Backend responded with ${response.status}`);
    }
    
    const xml = await response.text();
    
    // Validate it's actually XML
    if (!xml.trim().startsWith('<?xml') && !xml.trim().startsWith('<urlset')) {
      console.error('Backend returned non-XML content:', xml.substring(0, 200));
      throw new Error('Backend returned invalid XML');
    }
    
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(xml);
  } catch (error) {
    console.error('Error fetching sitemap:', error.message);
    // Return a basic sitemap instead of failing completely
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://navmanchnews.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.status(200).send(fallbackSitemap);
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



