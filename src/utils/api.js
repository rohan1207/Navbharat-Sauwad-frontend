// API utility with JSON fallback and caching
import apiCache from './cache.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Simple fetch helper with caching (similar to admin panel)
export const apiFetch = async (endpoint, options = {}) => {
  const { useCache = true, cacheTTL = 2 * 60 * 1000, ...fetchOptions } = options;
  
  // Check cache for GET requests
  if (useCache && (!fetchOptions.method || fetchOptions.method === 'GET')) {
    const cached = apiCache.get(endpoint, {}, cacheTTL);
    if (cached !== null) {
      return Promise.resolve(cached);
    }
  }

  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  const isFormData = typeof FormData !== 'undefined' && fetchOptions.body instanceof FormData;
  
  // Prepare body - stringify if it's an object and not FormData
  let body = fetchOptions.body;
  if (body && !isFormData && typeof body === 'object') {
    body = JSON.stringify(body);
  }
  
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...fetchOptions.headers,
  };

  const path = endpoint && endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Reduced timeout for faster newspaper loading (3 seconds instead of 5)
  const timeout = fetchOptions.timeout || 3000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const res = await fetch(`${API_BASE}${path}`, { 
      ...fetchOptions, 
      headers,
      body: body || fetchOptions.body,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

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
    let data;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    // Cache successful GET responses
    if (useCache && (!fetchOptions.method || fetchOptions.method === 'GET') && data) {
      apiCache.set(endpoint, {}, data);
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout: Server is not responding');
    }
    throw error;
  }
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

// Get all categories (with long cache - categories don't change often)
export const getCategories = async () => {
  // Check cache first - categories change rarely, so cache longer
  const cached = apiCache.get('/admin/categories', {}, 10 * 60 * 1000); // 10 min cache
  if (cached) {
    return cached;
  }

  const data = await fetchWithFallback('/admin/categories', 'categories');
  
  if (data && data.data) {
    // Cache the result
    apiCache.set('/admin/categories', {}, data.data);
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

// Get articles by category (with caching)
export const getArticlesByCategory = async (categoryId) => {
  // Handle both string IDs and ObjectIds
  const catId = categoryId?.toString();
  const cacheKey = `/articles?category=${catId}&status=published&limit=50`;
  
  // Check cache first
  const cached = apiCache.get(cacheKey, {}, 3 * 60 * 1000); // 3 min cache
  if (cached) {
    return cached;
  }

  // Try API first with timeout
  try {
    // Add timeout (3 seconds for category articles)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    try {
      const response = await fetch(`${API_BASE}/articles?category=${catId}&status=published&limit=50`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.data && data.data.length > 0) {
          // Cache the result
          apiCache.set(cacheKey, {}, data.data);
          console.log(`✅ Loaded ${data.data.length} articles for category ${catId} from API`);
          return data.data;
        } else {
          console.log(`⚠️ No articles found for category ${catId} in API`);
        }
      } else {
        console.warn(`API returned ${response.status} for category ${catId}`);
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.warn(`Timeout loading articles for category ${catId}`);
      } else {
        throw fetchError;
      }
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

// Get featured articles (with caching)
export const getFeaturedArticles = async () => {
  // Check cache first
  const cached = apiCache.get('/articles?isFeatured=true&status=published&limit=5', {}, 3 * 60 * 1000); // 3 min cache
  if (cached) {
    return cached;
  }

  const data = await fetchWithFallback('/articles?isFeatured=true&status=published&limit=5', null);
  
  if (data && data.data) {
    // Cache the result
    apiCache.set('/articles?isFeatured=true&status=published&limit=5', {}, data.data);
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
  // Check cache first
  const cacheKey = `/articles?status=published&limit=${limit}&sort=publishedAt:desc`;
  const cached = apiCache.get(cacheKey, {}, 2 * 60 * 1000); // 2 min cache for latest
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(`${API_BASE}/articles?status=published&limit=${limit}&sort=publishedAt:desc`);
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.data && data.data.length > 0) {
        // Cache the result
        apiCache.set(cacheKey, {}, data.data);
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
  try {
    const data = await apiFetch('/shorts');
    if (data && data.length > 0) {
      return data;
    }
  } catch (error) {
    console.error('Error fetching shorts:', error);
  }
  
  // Fallback to JSON if API fails
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
