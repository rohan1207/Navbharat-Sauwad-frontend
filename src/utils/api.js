// API utility with JSON fallback
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Simple fetch helper (similar to admin panel)
export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  
  // Prepare body - stringify if it's an object and not FormData
  let body = options.body;
  if (body && !isFormData && typeof body === 'object') {
    body = JSON.stringify(body);
  }
  
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const path = endpoint && endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const res = await fetch(`${API_BASE}${path}`, { 
    ...options, 
    headers,
    body: body || options.body
  });

  if (!res.ok) {
    let errorBody = null;
    try {
      errorBody = await res.json();
    } catch (_) {
      // ignore json parse errors
    }
    const err = new Error((errorBody && (errorBody.message || errorBody.error)) || res.statusText || 'Request failed');
    err.status = res.status;
    err.body = errorBody;
    throw err;
  }

  // No content
  if (res.status === 204) return null;

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
};

// Load JSON fallback data
let fallbackData = null;

const loadFallbackData = async () => {
  if (!fallbackData) {
    try {
      const response = await fetch('/newsData.json');
      fallbackData = await response.json();
    } catch (error) {
      console.error('Error loading fallback data:', error);
      fallbackData = null;
    }
  }
  return fallbackData;
};

// Fetch with fallback
const fetchWithFallback = async (endpoint, fallbackKey = null) => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    
    if (!response.ok) {
      // Don't throw for 404 or empty results, just return null to use fallback
      if (response.status === 404) {
        console.warn(`API endpoint not found: ${endpoint}, using fallback`);
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if we got valid data
    if (data && (data.data || Array.isArray(data) || Object.keys(data).length > 0)) {
      return data;
    }
    
    // If data is empty, use fallback
    console.warn(`API returned empty data for ${endpoint}, using fallback`);
    return null;
  } catch (error) {
    console.warn(`API fetch failed for ${endpoint}, using fallback:`, error.message);
    
    // Load fallback data if not already loaded
    const fallback = await loadFallbackData();
    
    if (fallback && fallbackKey) {
      // Handle nested keys like 'data.articles'
      const keys = fallbackKey.split('.');
      let result = fallback;
      for (const key of keys) {
        result = result?.[key];
      }
      return result || null;
    }
    
    return null;
  }
};

// Get all categories
export const getCategories = async () => {
  const data = await fetchWithFallback('/admin/categories', 'categories');
  
  if (data && data.data) {
    return data.data;
  }
  
  // Fallback to JSON structure
  const fallback = await loadFallbackData();
  if (fallback && fallback.categories) {
    return fallback.categories.map(cat => ({
      _id: cat.id,
      id: cat.id,
      name: cat.name,
      nameEn: cat.nameEn,
      news: cat.news || []
    }));
  }
  
  return [];
};

// Get articles by category
export const getArticlesByCategory = async (categoryId) => {
  // Try API first
  try {
    // Handle both string IDs and ObjectIds
    const catId = categoryId?.toString();
    const response = await fetch(`${API_BASE}/articles?category=${catId}&status=published&limit=50`);
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.data && data.data.length > 0) {
        console.log(`✅ Loaded ${data.data.length} articles for category ${catId} from API`);
        return data.data;
      } else {
        console.log(`⚠️ No articles found for category ${catId} in API`);
      }
    } else {
      console.warn(`API returned ${response.status} for category ${catId}`);
    }
  } catch (error) {
    console.warn('API fetch failed for category articles:', error);
  }
  
  // Fallback to JSON
  const fallback = await loadFallbackData();
  if (fallback && fallback.categories) {
    // Try to match by id or _id
    const category = fallback.categories.find(cat => 
      cat.id === categoryId || cat._id === categoryId || cat.id?.toString() === categoryId?.toString()
    );
    if (category && category.news) {
      return category.news.map(article => ({
        _id: article.id,
        id: article.id,
        title: article.title,
        summary: article.summary,
        content: article.content,
        image: article.image,
        featuredImage: article.image,
        date: article.date,
        createdAt: article.date,
        author: article.author ? { name: article.author } : null,
        views: 0
      }));
    }
  }
  
  return [];
};

// Get single article
export const getArticle = async (id) => {
  // Validate ID before making request
  if (!id || id === 'undefined' || id === 'null') {
    console.warn('Invalid article ID provided:', id);
    return null;
  }
  
  try {
    const data = await fetchWithFallback(`/articles/${id}`, null);
    
    if (data) {
      return data;
    }
  } catch (error) {
    console.warn('Error fetching article:', error);
  }
  
  // Fallback to JSON
  const fallback = await loadFallbackData();
  if (fallback && fallback.categories) {
    for (const category of fallback.categories) {
      const article = category.news?.find(n => n.id === parseInt(id));
      if (article) {
        return {
          _id: article.id,
          id: article.id,
          title: article.title,
          summary: article.summary,
          content: article.content,
          image: article.image,
          featuredImage: article.image,
          date: article.date,
          createdAt: article.date,
          author: article.author ? { name: article.author } : null,
          views: 0
        };
      }
    }
  }
  
  return null;
};

// Get featured articles
export const getFeaturedArticles = async () => {
  const data = await fetchWithFallback('/articles?isFeatured=true&status=published&limit=5', null);
  
  if (data && data.data) {
    return data.data;
  }
  
  // Fallback - get first article from each category
  const fallback = await loadFallbackData();
  if (fallback && fallback.categories) {
    const featured = [];
    for (const category of fallback.categories.slice(0, 5)) {
      if (category.news && category.news.length > 0) {
        const article = category.news[0];
        featured.push({
          _id: article.id,
          id: article.id,
          title: article.title,
          summary: article.summary,
          content: article.content,
          image: article.image,
          featuredImage: article.image,
          date: article.date,
          createdAt: article.date,
          author: article.author ? { name: article.author } : null,
          views: 0
        });
      }
    }
    return featured;
  }
  
  return [];
};

// Get latest articles
export const getLatestArticles = async (limit = 10) => {
  try {
    const response = await fetch(`${API_BASE}/articles?status=published&limit=${limit}&sort=publishedAt:desc`);
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.data && data.data.length > 0) {
        console.log(`✅ Loaded ${data.data.length} articles from API`);
        return data.data;
      }
    }
  } catch (error) {
    console.warn('API fetch failed for latest articles:', error);
  }
  
  // Fallback - get recent articles from JSON
  console.warn('⚠️ Using fallback data for latest articles');
  const fallback = await loadFallbackData();
  if (fallback && fallback.categories) {
    const allArticles = [];
    fallback.categories.forEach(category => {
      if (category.news) {
        category.news.forEach(article => {
          allArticles.push({
            _id: article.id,
            id: article.id,
            title: article.title,
            summary: article.summary,
            content: article.content,
            image: article.image,
            featuredImage: article.image,
            date: article.date,
            createdAt: article.date,
            author: article.author ? { name: article.author } : null,
            views: 0
          });
        });
      }
    });
    // Sort by date and limit
    return allArticles
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  }
  
  return [];
};

// Get breaking news
export const getBreakingNews = async () => {
  const data = await fetchWithFallback('/articles?isBreaking=true&status=published&limit=5', null);
  
  if (data && data.data) {
    return data.data;
  }
  
  return [];
};

// Get shorts
export const getShorts = async () => {
  // Try to get from API (if you have a shorts endpoint)
  // For now, use fallback
  const fallback = await loadFallbackData();
  if (fallback && fallback.shorts) {
    return fallback.shorts;
  }
  
  return [];
};

export default {
  getCategories,
  getArticlesByCategory,
  getArticle,
  getFeaturedArticles,
  getLatestArticles,
  getBreakingNews,
  getShorts
};
