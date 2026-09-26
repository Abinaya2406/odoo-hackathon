import { apiFetch, mockApiCall, getStoredItem, setStoredItem } from './api';
import { SCANNABLE_PRODUCTS, INITIAL_RECENT_SCANS } from '../data/scannerData';

const RECENT_SCANS_KEY = 'scanner_recent_scans';

export const scannerService = {
  /**
   * Search for product by barcode, QR code string, or SKU.
   * Connects to live DB backend: GET /api/products/scan/{code}
   */
  async scanCode(rawCode) {
    if (!rawCode || !rawCode.trim()) {
      throw new Error('Please enter or scan a valid barcode/QR code.');
    }

    const cleaned = rawCode.trim();

    // 1. Try real database backend
    try {
      const liveProduct = await apiFetch(`/products/scan/${encodeURIComponent(cleaned)}`);
      if (liveProduct && liveProduct.sku) {
        await this.addRecentScan(liveProduct, rawCode);
        return liveProduct;
      }
    } catch (err) {
      console.info('Live scan lookup fallback to local catalogue:', err.message);
    }

    // 2. Fallback to local catalog
    const lowerCleaned = cleaned.toLowerCase();
    const matched = SCANNABLE_PRODUCTS.find(
      (p) =>
        p.sku.toLowerCase() === lowerCleaned ||
        p.barcode.toLowerCase() === lowerCleaned ||
        (p.qrCode && p.qrCode.toLowerCase() === lowerCleaned) ||
        p.name.toLowerCase().includes(lowerCleaned)
    );

    if (!matched) {
      const error = new Error(`No product found matching code "${rawCode}".`);
      error.code = 'PRODUCT_NOT_FOUND';
      throw error;
    }

    // Save into recent scans
    await this.addRecentScan(matched, rawCode);
    return mockApiCall(matched, 150);
  },

  /**
   * Retrieve list of recent scans with timestamps
   */
  async getRecentScans() {
    const stored = getStoredItem(RECENT_SCANS_KEY, INITIAL_RECENT_SCANS);
    return mockApiCall(stored, 100);
  },

  /**
   * Add a product to the recent scans log
   */
  async addRecentScan(product, codeUsed = null) {
    const current = getStoredItem(RECENT_SCANS_KEY, INITIAL_RECENT_SCANS);
    const newEntry = {
      id: `scan-${Date.now()}`,
      code: codeUsed || product.sku,
      type: (codeUsed && codeUsed.toUpperCase().includes('QR')) ? 'QR Code' : 'Barcode',
      scannedAt: 'Just now',
      productName: product.name,
      sku: product.sku,
      stock: `${product.currentStock} ${product.unit}`,
      status: product.status,
      warehouse: product.warehouse
    };

    // Filter duplicates and keep top 8
    const updated = [newEntry, ...current.filter((s) => s.sku !== product.sku)].slice(0, 8);
    setStoredItem(RECENT_SCANS_KEY, updated);
    return updated;
  },

  /**
   * Clear recent scans log
   */
  async clearRecentScans() {
    setStoredItem(RECENT_SCANS_KEY, []);
    return mockApiCall([]);
  },

  /**
   * Simulate camera capture with randomized or targeted test code
   */
  async simulateCameraScan(presetSku = null) {
    if (presetSku) {
      return this.scanCode(presetSku);
    }
    // Randomly pick a scannable product
    const randomProduct = SCANNABLE_PRODUCTS[Math.floor(Math.random() * SCANNABLE_PRODUCTS.length)];
    return this.scanCode(randomProduct.barcode);
  }
};
