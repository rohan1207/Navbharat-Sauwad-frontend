// Stats utility for managing live website statistics
const STATS_KEY = 'navmanch_stats';
const SESSION_KEY = 'navmanch_session';

// Get today's date string (YYYY-MM-DD)
const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Initialize stats with default values
const getDefaultStats = () => ({
  totalVisits: 120,
  visitsToday: 85,
  totalHits: 250,
  hitsToday: 180,
  lastVisitDate: getTodayString()
});

// Get stored stats
export const getStats = () => {
  if (typeof window === 'undefined') return getDefaultStats();
  
  try {
    const stored = localStorage.getItem(STATS_KEY);
    if (!stored) {
      const defaultStats = getDefaultStats();
      localStorage.setItem(STATS_KEY, JSON.stringify(defaultStats));
      return defaultStats;
    }
    
    const stats = JSON.parse(stored);
    const today = getTodayString();
    
    // Reset today's stats if it's a new day
    if (stats.lastVisitDate !== today) {
      stats.visitsToday = 0;
      stats.hitsToday = 0;
      stats.lastVisitDate = today;
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    }
    
    return stats;
  } catch (error) {
    console.error('Error reading stats:', error);
    return getDefaultStats();
  }
};

// Check if this is a new session (visit)
const isNewSession = () => {
  if (typeof window === 'undefined') return false;
  
  try {
    const sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      // New session - create session ID
      sessionStorage.setItem(SESSION_KEY, Date.now().toString());
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error checking session:', error);
    return false;
  }
};

// Increment stats on page visit
export const incrementStats = () => {
  if (typeof window === 'undefined') return;
  
  // Only track on navmanchnews.com domain
  const hostname = window.location.hostname;
  if (!hostname.includes('navmanchnews.com') && !hostname.includes('localhost')) {
    return;
  }
  
  try {
    const stats = getStats();
    const isNewVisit = isNewSession();
    
    // Increment hits (every page view)
    stats.totalHits = (stats.totalHits || 0) + 1;
    stats.hitsToday = (stats.hitsToday || 0) + 1;
    
    // Increment visits (only for new sessions)
    if (isNewVisit) {
      stats.totalVisits = (stats.totalVisits || 0) + 1;
      stats.visitsToday = (stats.visitsToday || 0) + 1;
    }
    
    // Update last visit date
    stats.lastVisitDate = getTodayString();
    
    // Save to localStorage
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    
    // Dispatch event for components to listen
    window.dispatchEvent(new CustomEvent('statsUpdated', { detail: stats }));
    
    return stats;
  } catch (error) {
    console.error('Error incrementing stats:', error);
  }
};

// Initialize stats on page load
export const initStats = () => {
  if (typeof window === 'undefined') return;
  
  // Increment stats on every page load
  incrementStats();
};

