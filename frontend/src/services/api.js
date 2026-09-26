/**
 * REST API client & local persistence helper
 * Connects seamlessly to Flask backend with graceful fallback
 */

export const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Perform fetch with timeout to backend
 */
export const apiFetch = async (endpoint, options = {}, timeoutMs = 3000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const token = getStoredItem('token', null);

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });

    clearTimeout(id);

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const error = new Error(errBody.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = errBody;
      throw error;
    }

    const json = await response.json();
    return json.data !== undefined ? json.data : json;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

/**
 * Simulated async REST API wrapper with artificial network latency
 */
export const mockApiCall = (data, delayMs = 150) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(JSON.parse(JSON.stringify(data)));
    }, delayMs);
  });
};

export const getStoredItem = (key, fallback) => {
  try {
    const item = localStorage.getItem(`stocksense_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

export const setStoredItem = (key, value) => {
  try {
    localStorage.setItem(`stocksense_${key}`, JSON.stringify(value));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }
};
