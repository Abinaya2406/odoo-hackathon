import { mockApiCall, getStoredItem, setStoredItem } from './api';
import { INITIAL_WAREHOUSES } from '../data/warehouses';

export const warehouseService = {
  async getWarehouses() {
    const data = getStoredItem('warehouses', INITIAL_WAREHOUSES);
    return mockApiCall(data);
  },

  async getWarehouseById(id) {
    const warehouses = getStoredItem('warehouses', INITIAL_WAREHOUSES);
    const wh = warehouses.find((w) => w.id === id);
    if (!wh) throw new Error('Warehouse not found.');
    return mockApiCall(wh);
  },

  async createWarehouse(whData) {
    const warehouses = getStoredItem('warehouses', INITIAL_WAREHOUSES);
    const newWh = {
      ...whData,
      id: `wh-${Date.now()}`,
      code: whData.code || `WH-${whData.name.substring(0,3).toUpperCase()}-0${warehouses.length + 1}`,
      totalProducts: Number(whData.totalProducts) || 0,
      totalQuantity: Number(whData.totalQuantity) || 0,
      capacity: Number(whData.capacity) || 10000,
      status: 'Active',
      zones: whData.zones ? (Array.isArray(whData.zones) ? whData.zones : whData.zones.split(',')) : ['Zone A', 'Zone B']
    };
    const updated = [...warehouses, newWh];
    setStoredItem('warehouses', updated);
    return mockApiCall(newWh);
  }
};
