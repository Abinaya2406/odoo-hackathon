/**
 * Simulated async REST API wrapper with artificial network latency
 */

export const mockApiCall = (data, delayMs = 250) => {
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
