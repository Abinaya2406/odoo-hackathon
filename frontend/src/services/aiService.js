import { mockApiCall, getStoredItem, setStoredItem } from './api';
import {
  AI_DEMAND_FORECASTS,
  SMART_REORDER_ITEMS,
  ANOMALY_DETECTIONS,
  AI_RECOMMENDATIONS
} from '../data/aiPredictions';

export const aiService = {
  async getDemandForecasts() {
    const data = getStoredItem('ai_forecasts', AI_DEMAND_FORECASTS);
    return mockApiCall(data);
  },

  async getSmartReorderItems() {
    const data = getStoredItem('smart_reorders', SMART_REORDER_ITEMS);
    return mockApiCall(data);
  },

  async getAnomalies() {
    const data = getStoredItem('ai_anomalies', ANOMALY_DETECTIONS);
    return mockApiCall(data);
  },

  async markAnomalyReviewed(id) {
    const anomalies = getStoredItem('ai_anomalies', ANOMALY_DETECTIONS);
    const updated = anomalies.map((a) => (a.id === id ? { ...a, status: 'Reviewed' } : a));
    setStoredItem('ai_anomalies', updated);
    return mockApiCall({ success: true, id });
  },

  async getRecommendations() {
    const data = getStoredItem('ai_recommendations', AI_RECOMMENDATIONS);
    return mockApiCall(data);
  }
};
