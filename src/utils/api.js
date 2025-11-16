import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const apiFetch = async (endpoint, options = {}) => {
  const { method = 'GET', body = null, headers = {} } = options;

  const config = {
    method,
    url: `${API_URL}${endpoint}`,
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
