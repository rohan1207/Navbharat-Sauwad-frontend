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
  
  // Increased timeout for better reliability (10 seconds for most requests, 15 for critical)
  // Only use timeout for non-critical requests, let critical ones take longer
  const timeout = fetchOptions.timeout || (fetchOptions.critical ? 15000 : 10000);
  const controller = new AbortController();
  const timeoutId = timeout ? setTimeout(() => controller.abort(), timeout) : null;
  
  try {
    const res = await fetch(`${API_BASE}${path}`, { 
      ...fetchOptions, 
      headers,
      body: body || fetchOptions.body,
      signal: controller.signal
    });
    if (timeoutId) clearTimeout(timeoutId);

    if (!res.ok) {
      // Don't throw for 404 or 500 - return null to allow fallback
      if (res.status === 404 || res.status >= 500) {
        return null;
      }
      
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
    } else if (contentType.includes('text/html')) {
      // If we get HTML instead of JSON, server might be returning error page
      console.warn(`Received HTML instead of JSON for ${endpoint}`);
      return null;
    } else {
      data = await res.text();
    }

    // Cache successful GET responses
    if (useCache && (!fetchOptions.method || fetchOptions.method === 'GET') && data) {
      apiCache.set(endpoint, {}, data);
    }

    return data;
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      // Don't throw timeout errors - return null to allow graceful fallback
      console.warn(`Request timeout for ${endpoint} - using fallback or cached data`);
      return null;
    }
    // For other errors, only throw if it's a critical request
    if (fetchOptions.critical) {
      throw error;
    }
    // For non-critical requests, return null to allow fallback
    return null;
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

  try {
    const data = await apiFetch('/admin/categories', {
      timeout: 12000, // 12 second timeout for critical data
      critical: true,
      useCache: true,
      cacheTTL: 10 * 60 * 1000
    });
    
    if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
      // Cache the result
      apiCache.set('/admin/categories', {}, data.data);
      return data.data;
    } else if (data && Array.isArray(data) && data.length > 0) {
      // Cache the result
      apiCache.set('/admin/categories', {}, data);
      return data;
    }
  } catch (error) {
    // Silently fail - will use fallback
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

  // Try API first with longer timeout (non-blocking, fails gracefully)
  try {
    // Use longer timeout (10 seconds) and don't block if it fails
    const response = await apiFetch(`/articles?category=${catId}&status=published&limit=50`, {
      timeout: 10000,
      useCache: true,
      cacheTTL: 5 * 60 * 1000 // 5 min cache for category articles
    });
    
    if (response && Array.isArray(response) && response.length > 0) {
      // Cache the result
      apiCache.set(cacheKey, {}, response);
      return response;
    } else if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
      // Cache the result
      apiCache.set(cacheKey, {}, response.data);
      return response.data;
    }
  } catch (error) {
    // Silently fail - will use fallback below
    // Don't log errors for category articles as they're loaded in background
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

  try {
    const data = await apiFetch('/articles?isFeatured=true&status=published&limit=5', {
      timeout: 12000, // 12 second timeout for critical data
      critical: true,
      useCache: true,
      cacheTTL: 3 * 60 * 1000
    });
    
    if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
      // Cache the result
      apiCache.set('/articles?isFeatured=true&status=published&limit=5', {}, data.data);
      return data.data;
    } else if (data && Array.isArray(data) && data.length > 0) {
      // Cache the result
      apiCache.set('/articles?isFeatured=true&status=published&limit=5', {}, data);
      return data;
    }
  } catch (error) {
    // Silently fail - will use fallback
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
    // Use apiFetch with longer timeout for critical data
    const data = await apiFetch(`/articles?status=published&limit=${limit}&sort=publishedAt:desc`, {
      timeout: 12000, // 12 second timeout for critical data
      critical: true, // Mark as critical
      useCache: true,
      cacheTTL: 2 * 60 * 1000
    });
    
    if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
      // Cache the result
      apiCache.set(cacheKey, {}, data.data);
      return data.data;
    } else if (data && Array.isArray(data) && data.length > 0) {
      // Cache the result
      apiCache.set(cacheKey, {}, data);
      return data;
    }
  } catch (error) {
    // Silently fail - will use fallback
  }
  
  // Fallback - get recent articles from JSON
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

// Helper function to clear "most read" cache when views are incremented
export const clearMostReadCache = () => {
  // Clear cache for different limit values
  apiCache.clear('/articles', { status: 'published', limit: '5', sort: 'views:desc' });
  apiCache.clear('/articles', { status: 'published', limit: '10', sort: 'views:desc' });
  apiCache.clear('/articles', { status: 'published', limit: '20', sort: 'views:desc' });
};

// Get most read articles (sorted by views)
export const getMostReadArticles = async (limit = 5) => {
  const cacheKey = `/articles?status=published&limit=${limit}&sort=views:desc`;
  const cached = apiCache.get(cacheKey, {}, 1 * 60 * 1000); // Reduced to 1 min cache for faster updates
  if (cached) {
    return cached;
  }

  try {
    const data = await apiFetch(`/articles?status=published&limit=${limit}&sort=views:desc`, {
      timeout: 10000,
      useCache: false, // Don't use cache here, we'll set it manually
      cacheTTL: 1 * 60 * 1000 // 1 min cache
    });
    
    if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
      apiCache.set(cacheKey, {}, data.data);
      return data.data;
    } else if (data && Array.isArray(data) && data.length > 0) {
      apiCache.set(cacheKey, {}, data);
      return data;
    }
  } catch (error) {
    // Silently fail - will use fallback
  }
  
  // Fallback - sort by views if available
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
            views: article.views || Math.floor(Math.random() * 1000) // Random views for fallback
          });
        });
      }
    });
    // Sort by views descending
    return allArticles
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit);
  }
  
  return [];
};

// Get popular articles (sorted by views, but different from most read - could be recent popular)
export const getPopularArticles = async (limit = 5) => {
  const cacheKey = `/articles?status=published&limit=${limit * 2}&sort=views:desc`;
  const cached = apiCache.get(cacheKey, {}, 5 * 60 * 1000); // 5 min cache
  if (cached) {
    // Filter to get articles from last 7 days that are popular
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentPopular = cached.filter(article => {
      const articleDate = new Date(article.publishedAt || article.createdAt || article.date);
      return articleDate >= weekAgo;
    });
    if (recentPopular.length >= limit) {
      return recentPopular.slice(0, limit);
    }
    // If not enough recent popular, return top viewed overall
    return cached.slice(0, limit);
  }

  try {
    // Get more articles to filter for recent popular ones
    const data = await apiFetch(`/articles?status=published&limit=${limit * 2}&sort=views:desc`, {
      timeout: 10000,
      useCache: true,
      cacheTTL: 5 * 60 * 1000
    });
    
    let articles = [];
    if (data && data.data && Array.isArray(data.data)) {
      articles = data.data;
    } else if (data && Array.isArray(data)) {
      articles = data;
    }
    
    if (articles.length > 0) {
      // Filter for articles from last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentPopular = articles.filter(article => {
        const articleDate = new Date(article.publishedAt || article.createdAt || article.date);
        return articleDate >= weekAgo;
      });
      
      if (recentPopular.length >= limit) {
        apiCache.set(cacheKey, {}, recentPopular.slice(0, limit));
        return recentPopular.slice(0, limit);
      }
      
      // If not enough recent popular, return top viewed overall
      const result = articles.slice(0, limit);
      apiCache.set(cacheKey, {}, result);
      return result;
    }
  } catch (error) {
    // Silently fail - will use fallback
  }
  
  // Fallback
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
            views: article.views || Math.floor(Math.random() * 500)
          });
        });
      }
    });
    // Sort by views and get recent ones
    const sorted = allArticles.sort((a, b) => (b.views || 0) - (a.views || 0));
    return sorted.slice(0, limit);
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
  getMostReadArticles,
  getPopularArticles,
  getBreakingNews,
  getShorts,
  clearMostReadCache
};
