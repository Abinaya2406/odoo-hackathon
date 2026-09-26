import { mockApiCall, getStoredItem, setStoredItem } from './api';
import { ANOMALY_RECORDS, ANOMALY_KPIS } from '../data/anomalies';

const ANOMALIES_STORAGE_KEY = 'ai_anomalies_records';

export const anomalyService = {
  /**
   * Fetch anomalies with support for multifaceted filters.
   * Prepared for future: GET /api/ai/anomalies
   */
  async getAnomalies(filters = {}) {
    const list = getStoredItem(ANOMALIES_STORAGE_KEY, ANOMALY_RECORDS);

    let result = [...list];

    if (filters.severity && filters.severity !== 'All') {
      result = result.filter(
        (a) => a.severity.toLowerCase() === filters.severity.toLowerCase()
      );
    }

    if (filters.warehouse && filters.warehouse !== 'All') {
      result = result.filter((a) =>
        a.warehouse.toLowerCase().includes(filters.warehouse.toLowerCase())
      );
    }

    if (filters.eventType && filters.eventType !== 'All') {
      result = result.filter(
        (a) => a.eventType.toLowerCase() === filters.eventType.toLowerCase()
      );
    }

    if (filters.status && filters.status !== 'All') {
      result = result.filter(
        (a) => a.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.productName.toLowerCase().includes(q) ||
          a.sku.toLowerCase().includes(q) ||
          a.eventType.toLowerCase().includes(q) ||
          a.user.toLowerCase().includes(q)
      );
    }

    return mockApiCall(result, 250);
  },

  /**
   * Get single anomaly by ID
   */
  async getAnomalyById(id) {
    const list = getStoredItem(ANOMALIES_STORAGE_KEY, ANOMALY_RECORDS);
    const item = list.find((a) => a.id === id);
    if (!item) {
      throw new Error(`Anomaly record not found for: ${id}`);
    }
    return mockApiCall(item, 150);
  },

  /**
   * Update status of an anomaly: 'Reviewed' | 'Confirmed' | 'Ignored'
   */
  async updateStatus(id, newStatus) {
    const list = getStoredItem(ANOMALIES_STORAGE_KEY, ANOMALY_RECORDS);
    const updated = list.map((a) => (a.id === id ? { ...a, status: newStatus } : a));
    setStoredItem(ANOMALIES_STORAGE_KEY, updated);
    return mockApiCall({ success: true, id, status: newStatus }, 200);
  },

  /**
   * Get dashboard metrics for anomalies
   */
  async getAnomalyKPIs() {
    const list = getStoredItem(ANOMALIES_STORAGE_KEY, ANOMALY_RECORDS);
    const total = list.length;
    const critical = list.filter((a) => a.severity === 'Critical' || a.severity === 'High').length;
    const movements = list.filter((a) => a.eventType.includes('issue') || a.eventType.includes('receipt') || a.eventType.includes('transfer')).length;
    const variations = list.filter((a) => a.eventType.includes('adjustment') || a.eventType.includes('frequency') || a.eventType.includes('spike')).length;

    const kpis = {
      totalAnomalies: total || ANOMALY_KPIS.totalAnomalies,
      criticalAnomalies: critical || ANOMALY_KPIS.criticalAnomalies,
      unusualStockMovements: movements || ANOMALY_KPIS.unusualMovements,
      quantityVariations: variations || ANOMALY_KPIS.quantityVariations
    };

    return mockApiCall(kpis, 150);
  }
};
