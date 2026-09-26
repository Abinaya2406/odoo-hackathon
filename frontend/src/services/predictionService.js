import { mockApiCall, getStoredItem, setStoredItem } from './api';
import { STOCKOUT_PREDICTIONS, PREDICTION_KPIS } from '../data/predictions';

const PREDICTIONS_STORAGE_KEY = 'ai_stockout_predictions';

export const predictionService = {
  /**
   * Fetch all stockout predictions.
   * Prepared for future: GET /api/ai/stockout-predictions
   */
  async getStockoutPredictions(filters = {}) {
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

    return mockApiCall(filtered, 250);
  },

  /**
   * Get single prediction record by id or SKU
   */
  async getPredictionById(identifier) {
    const list = getStoredItem(PREDICTIONS_STORAGE_KEY, STOCKOUT_PREDICTIONS);
    const item = list.find(
      (p) => p.id === identifier || p.sku.toLowerCase() === String(identifier).toLowerCase()
    );
    if (!item) {
      throw new Error(`Stockout prediction not found for: ${identifier}`);
    }
    return mockApiCall(item, 150);
  },

  /**
   * Calculate and return current dashboard KPIs
   */
  async getPredictionKPIs() {
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

    return mockApiCall(kpis, 150);
  }
};
