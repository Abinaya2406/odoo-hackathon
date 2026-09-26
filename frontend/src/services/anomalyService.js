import { apiFetch, mockApiCall, getStoredItem, setStoredItem } from './api';
import { ANOMALY_RECORDS, ANOMALY_KPIS } from '../data/anomalies';

const ANOMALIES_STORAGE_KEY = 'ai_anomalies_records';
const ANOMALIES_KPIS_KEY = 'ai_anomalies_kpis';

export const anomalyService = {
  /**
   * Fetch anomalies with support for multifaceted filters.
   * Connects to live DB backend: GET /api/ai/anomalies
   */
  async getAnomalies(filters = {}) {
    const params = new URLSearchParams();
    if (filters.severity && filters.severity !== 'All') params.append('severity', filters.severity);
    if (filters.warehouse && filters.warehouse !== 'All') params.append('warehouse', filters.warehouse);
    if (filters.eventType && filters.eventType !== 'All') params.append('eventType', filters.eventType);
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    const queryStr = params.toString() ? `?${params.toString()}` : '';

    // 1. Try real database backend
    try {
      const data = await apiFetch(`/ai/anomalies${queryStr}`);
      const items = Array.isArray(data) ? data : (data.items || []);
      if (data.kpis) {
        setStoredItem(ANOMALIES_KPIS_KEY, data.kpis);
      }
      if (items.length > 0) {
        setStoredItem(ANOMALIES_STORAGE_KEY, items);
        return items;
      }
    } catch (err) {
      console.info('Anomaly detection fallback to cached/mock data:', err.message);
    }

    // 2. Fallback to cached or mock data
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

    return mockApiCall(result, 150);
  },

  /**
   * Get single anomaly by ID
   */
  async getAnomalyById(id) {
    const list = getStoredItem(ANOMALIES_STORAGE_KEY, ANOMALY_RECORDS);
    const item = list.find((a) => a.id === id);
    if (item) {
      return mockApiCall(item, 100);
    }

    try {
      const data = await apiFetch(`/ai/anomalies?search=${encodeURIComponent(id)}`);
      const items = Array.isArray(data) ? data : (data.items || []);
      const matched = items.find((a) => a.id === id);
      if (matched) return matched;
    } catch {
      // Fallback
    }

    throw new Error(`Anomaly record not found for: ${id}`);
  },

  /**
   * Update status of an anomaly: 'Reviewed' | 'Confirmed' | 'Ignored'
   */
  async updateStatus(id, newStatus) {
    // 1. Update in backend
    try {
      await apiFetch(`/ai/anomalies/${id}/status?status=${encodeURIComponent(newStatus)}`, {
        method: 'POST',
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.info('Backend anomaly status update fallback to local store:', err.message);
    }

    // 2. Keep local cache updated
    const list = getStoredItem(ANOMALIES_STORAGE_KEY, ANOMALY_RECORDS);
    const updated = list.map((a) => (a.id === id ? { ...a, status: newStatus } : a));
    setStoredItem(ANOMALIES_STORAGE_KEY, updated);

    return { success: true, id, status: newStatus };
  },

  /**
   * Get dashboard metrics for anomalies
   */
  async getAnomalyKPIs() {
    // 1. Try real database backend
    try {
      const data = await apiFetch('/ai/anomalies');
      if (data && data.kpis) {
        setStoredItem(ANOMALIES_KPIS_KEY, data.kpis);
        return data.kpis;
      }
    } catch (err) {
      console.info('Anomaly KPIs fallback to cached computation:', err.message);
    }

    // 2. Fallback to cached/calculated KPIs
    const cachedKpis = getStoredItem(ANOMALIES_KPIS_KEY, null);
    if (cachedKpis) return cachedKpis;

    const list = getStoredItem(ANOMALIES_STORAGE_KEY, ANOMALY_RECORDS);
    const total = list.length;
    const critical = list.filter((a) => a.severity === 'Critical' || a.severity === 'High').length;
    const movements = list.filter((a) => a.eventType.includes('issue') || a.eventType.includes('receipt') || a.eventType.includes('transfer')).length;
    const variations = list.filter((a) => a.eventType.includes('adjustment') || a.eventType.includes('decrease') || a.eventType.includes('spike')).length;

    const kpis = {
      totalAnomalies: total || ANOMALY_KPIS.totalAnomalies,
      criticalAnomalies: critical || ANOMALY_KPIS.criticalAnomalies,
      unusualStockMovements: movements || ANOMALY_KPIS.unusualMovements,
      quantityVariations: variations || ANOMALY_KPIS.quantityVariations
    };

    return mockApiCall(kpis, 100);
  }
};
