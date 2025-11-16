import axios from 'axios';

// Get base URL from environment variable
const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:5001';
// Normalize the base URL - ensure it doesn't have trailing slash
let normalizedBase = rawBase.replace(/\/$/, '');
// Ensure it includes /api at the end
if (!normalizedBase.endsWith('/api')) {
  normalizedBase = `${normalizedBase}/api`;
}
const API_URL = normalizedBase;

export const apiFetch = async (endpoint, options = {}) => {
  const { method = 'GET', body = null, headers = {} } = options;

  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const config = {
    method,
    url: `${API_URL}${normalizedEndpoint}`,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    config.data = body;
  }

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`API Fetch Error: ${error.response ? error.response.status : ''} ${error.message}`);
    throw error.response ? error.response.data : new Error('Network error');
  }
};
