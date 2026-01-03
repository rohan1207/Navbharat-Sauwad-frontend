import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BACKEND_URL = process.env.VITE_BACKEND_URL || 'https://navmanch-backend.onrender.com';
const OUTPUT_PATH = join(__dirname, '..', 'public', 'sitemap.xml');

async function generateSitemap() {
  try {
    console.log('🔄 Fetching sitemap from backend...');
    const response = await fetch(`${BACKEND_URL}/sitemap.xml`);
    
    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }
    
    const xml = await response.text();
    
    // Validate it's actually XML
    if (!xml.trim().startsWith('<?xml') && !xml.trim().startsWith('<urlset')) {
      console.error('❌ Backend returned non-XML content');
      throw new Error('Backend returned invalid XML');
    }
    
    writeFileSync(OUTPUT_PATH, xml, 'utf-8');
    console.log('✅ Sitemap generated successfully at:', OUTPUT_PATH);
    console.log(`📄 Sitemap size: ${(xml.length / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error.message);
    console.log('📝 Generating fallback static sitemap...');
    
    // Fallback static sitemap
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://navmanchnews.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://navmanchnews.com/epaper</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://navmanchnews.com/epaper2</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://navmanchnews.com/gallery</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://navmanchnews.com/blogs</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://navmanchnews.com/articles</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://navmanchnews.com/shorts</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://navmanchnews.com/events</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;
    
    writeFileSync(OUTPUT_PATH, fallback, 'utf-8');
    console.log('✅ Fallback sitemap generated at:', OUTPUT_PATH);
    console.log('⚠️  Note: This is a basic sitemap. For full sitemap, ensure backend is accessible.');
  }
}

generateSitemap();
