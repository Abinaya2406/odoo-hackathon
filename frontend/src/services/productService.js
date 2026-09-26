import { mockApiCall, getStoredItem, setStoredItem } from './api';
import { INITIAL_PRODUCTS } from '../data/products';

export const productService = {
  async getProducts() {
    const products = getStoredItem('products', INITIAL_PRODUCTS);
    return mockApiCall(products);
  },

  async getProductById(id) {
    const products = getStoredItem('products', INITIAL_PRODUCTS);
    const product = products.find((p) => p.id === id);
    if (!product) {
      throw new Error(`Product with ID ${id} not found.`);
    }
    return mockApiCall(product);
  },

  async createProduct(productData) {
    const products = getStoredItem('products', INITIAL_PRODUCTS);
    const currentStock = Number(productData.currentStock || productData.initialStock) || 0;
    const minStock = Number(productData.minStock) || 10;
    
    let status = 'In Stock';
    if (currentStock === 0) status = 'Out of Stock';
    else if (currentStock <= minStock) status = 'Low Stock';

    const newProduct = {
      ...productData,
      id: `prod-${Date.now()}`,
      sku: productData.sku || `SKU-GEN-${Math.floor(1000 + Math.random() * 9000)}`,
      currentStock,
      minStock,
      maxStock: Number(productData.maxStock) || (currentStock + 200),
      reorderQty: Number(productData.reorderQty) || 50,
      unitPrice: Number(productData.unitPrice) || 500,
      status,
      lastUpdated: new Date().toISOString()
    };

    const updated = [newProduct, ...products];
    setStoredItem('products', updated);
    return mockApiCall(newProduct);
  },

  async updateProduct(id, productData) {
    const products = getStoredItem('products', INITIAL_PRODUCTS);
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error('Product not found.');
    }

    const currentStock = Number(productData.currentStock ?? products[index].currentStock);
    const minStock = Number(productData.minStock ?? products[index].minStock);

    let status = 'In Stock';
    if (currentStock === 0) status = 'Out of Stock';
    else if (currentStock <= minStock) status = 'Low Stock';

    const updatedProduct = {
      ...products[index],
      ...productData,
      currentStock,
      minStock,
      status,
      lastUpdated: new Date().toISOString()
    };

    products[index] = updatedProduct;
    setStoredItem('products', products);
    return mockApiCall(updatedProduct);
  },

  async deleteProduct(id) {
    const products = getStoredItem('products', INITIAL_PRODUCTS);
    const filtered = products.filter((p) => p.id !== id);
    setStoredItem('products', filtered);
    return mockApiCall({ success: true, id });
  }
};
