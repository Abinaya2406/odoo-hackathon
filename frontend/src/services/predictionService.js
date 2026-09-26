import { apiFetch, mockApiCall, getStoredItem, setStoredItem } from './api';
import { STOCKOUT_PREDICTIONS, PREDICTION_KPIS } from '../data/predictions';

const PREDICTIONS_STORAGE_KEY = 'ai_stockout_predictions';
const PREDICTIONS_KPIS_KEY = 'ai_stockout_kpis';

export const predictionService = {
  /**
   * Fetch all stockout predictions from live database.
   * Route: GET /api/ai/stockout-predictions
   */
  async getStockoutPredictions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.riskLevel && filters.riskLevel !== 'All') {
      params.append('riskLevel', filters.riskLevel);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }

    const queryStr = params.toString() ? `?${params.toString()}` : '';

    // 1. Try real database backend
    try {
      const data = await apiFetch(`/ai/stockout-predictions${queryStr}`);
      const items = Array.isArray(data) ? data : (data.items || []);
      if (data.kpis) {
        setStoredItem(PREDICTIONS_KPIS_KEY, data.kpis);
      }
      if (items.length > 0) {
        setStoredItem(PREDICTIONS_STORAGE_KEY, items);
        return items;
      }
    } catch (err) {
      console.info('Stockout predictions fallback to cached/mock data:', err.message);
    }

    // 2. Fallback to cached or mock data
    const list = getStoredItem(PREDICTIONS_STORAGE_KEY, STOCKOUT_PREDICTIONS);
    let filtered = [...list];

    if (filters.riskLevel && filters.riskLevel !== 'All') {
      filtered = filtered.filter(
        (p) => p.riskLevel.toLowerCase() === filters.riskLevel.toLowerCase()
      );
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.productName.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.warehouse.toLowerCase().includes(q)
      );
    }

    return mockApiCall(filtered, 150);
  },

  /**
   * Get single prediction record by id or SKU
   */
  async getPredictionById(identifier) {
    const list = getStoredItem(PREDICTIONS_STORAGE_KEY, STOCKOUT_PREDICTIONS);
    const item = list.find(
      (p) => p.id === identifier || p.sku.toLowerCase() === String(identifier).toLowerCase()
    );
    if (item) {
      return mockApiCall(item, 100);
    }

    // Attempt lookup from server
    try {
      const liveData = await apiFetch(`/ai/stockout-predictions?search=${encodeURIComponent(identifier)}`);
      const items = Array.isArray(liveData) ? liveData : (liveData.items || []);
      const matched = items.find(
        (p) => p.id === identifier || p.sku.toLowerCase() === String(identifier).toLowerCase()
      );
      if (matched) return matched;
    } catch {
      // Fallback
    }

    throw new Error(`Stockout prediction not found for: ${identifier}`);
  },

  /**
   * Return current dashboard KPIs
   */
  async getPredictionKPIs() {
    // 1. Try real database backend
    try {
      const data = await apiFetch('/ai/stockout-predictions');
      if (data && data.kpis) {
        setStoredItem(PREDICTIONS_KPIS_KEY, data.kpis);
        return data.kpis;
      }
    } catch (err) {
      console.info('Stockout KPIs fallback to cached computation:', err.message);
    }

    // 2. Fallback to cached/calculated KPIs
    const cachedKpis = getStoredItem(PREDICTIONS_KPIS_KEY, null);
    if (cachedKpis) return cachedKpis;

    const list = getStoredItem(PREDICTIONS_STORAGE_KEY, STOCKOUT_PREDICTIONS);
    const productsAtRisk = list.filter((p) => ['Critical', 'High', 'Medium'].includes(p.riskLevel)).length;
    const stockoutsPredicted = list.filter((p) => p.predictedStockoutDays <= 7).length;
    const criticalProducts = list.filter((p) => p.riskLevel === 'Critical' || p.currentStock === 0).length;
    
    const validDays = list.filter((p) => p.predictedStockoutDays > 0);
    const avgDays = validDays.length > 0
      ? (validDays.reduce((acc, curr) => acc + curr.predictedStockoutDays, 0) / validDays.length).toFixed(1)
      : 0;

    const kpis = {
      productsAtRisk,
      stockoutsPredicted,
      criticalProducts,
      avgDaysToStockout: parseFloat(avgDays) || PREDICTION_KPIS.avgDaysToStockout
    };

    return mockApiCall(kpis, 100);
  }
};
