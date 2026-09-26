import { mockApiCall, getStoredItem } from './api';
import { INITIAL_PRODUCTS } from '../data/products';
import { INITIAL_WAREHOUSES } from '../data/warehouses';

export const inventoryService = {
  async getInventoryOverview() {
    const products = getStoredItem('products', INITIAL_PRODUCTS);
    const warehouses = getStoredItem('warehouses', INITIAL_WAREHOUSES);

    const totalProducts = products.length;
    const totalStockUnits = products.reduce((acc, p) => acc + (Number(p.currentStock) || 0), 0);
    const lowStockCount = products.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStock).length;
    const outOfStockCount = products.filter((p) => p.currentStock === 0).length;
    const totalInventoryValue = products.reduce(
      (acc, p) => acc + (Number(p.currentStock) || 0) * (Number(p.unitPrice) || 0),
      0
    );

    // Grouping by category
    const categoryMap = {};
    products.forEach((p) => {
      const cat = p.category || 'Unassigned';
      categoryMap[cat] = (categoryMap[cat] || 0) + (Number(p.currentStock) || 0);
    });

    const stockByCategory = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    // Grouping by warehouse
    const warehouseStock = warehouses.map((w) => {
      const whProds = products.filter((p) => p.warehouseId === w.id);
      const qty = whProds.reduce((acc, p) => acc + (Number(p.currentStock) || 0), 0);
      return {
        name: w.name,
        code: w.code,
        stock: qty,
        capacity: w.capacity
      };
    });

    return mockApiCall({
      totalProducts,
      totalStockUnits,
      lowStockCount,
      outOfStockCount,
      totalInventoryValue,
      stockByCategory,
      warehouseStock,
      products
    });
  }
};
