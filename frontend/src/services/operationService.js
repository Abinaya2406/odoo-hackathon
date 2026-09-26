import { mockApiCall, getStoredItem, setStoredItem } from './api';
import { INITIAL_RECEIPTS } from '../data/receipts';
import { INITIAL_DELIVERIES } from '../data/deliveries';
import { INITIAL_TRANSFERS } from '../data/transfers';
import { INITIAL_ADJUSTMENTS } from '../data/adjustments';
import { INITIAL_PRODUCTS } from '../data/products';

const getMoveHistoryFromStorage = () => {
  const initialMoves = [
    {
      id: 'MOV-1001',
      date: '2026-09-24T14:30:00Z',
      transactionId: 'REC-2026-001',
      productId: 'prod-001',
      productName: 'Wireless Industrial Barcode Scanner X-200',
      sku: 'SKU-ELEC-1001',
      action: 'Receipt',
      quantity: 50,
      fromLocation: 'Supplier (LogiTech)',
      toLocation: 'CDC Bengaluru (Rack A-12)',
      user: 'Alex Morgan',
      status: 'Done'
    },
    {
      id: 'MOV-1002',
      date: '2026-09-24T16:10:00Z',
      transactionId: 'DEL-2026-089',
      productId: 'prod-001',
      productName: 'Wireless Industrial Barcode Scanner X-200',
      sku: 'SKU-ELEC-1001',
      action: 'Delivery',
      quantity: -15,
      fromLocation: 'CDC Bengaluru',
      toLocation: 'Customer (Apex Auto)',
      user: 'Alex Morgan',
      status: 'Done'
    },
    {
      id: 'MOV-1003',
      date: '2026-09-25T11:00:00Z',
      transactionId: 'ADJ-2026-015',
      productId: 'prod-002',
      productName: 'Smart IoT Temperature & Humidity Sensor',
      sku: 'SKU-COMP-2042',
      action: 'Stock Adjustment',
      quantity: -4,
      fromLocation: 'CDC Bengaluru',
      toLocation: 'Scrap / Damaged',
      user: 'Alex Morgan',
      status: 'Done'
    }
  ];
  return getStoredItem('move_history', initialMoves);
};

export const operationService = {
  // --- RECEIPTS ---
  async getReceipts() {
    const data = getStoredItem('receipts', INITIAL_RECEIPTS);
    return mockApiCall(data);
  },

  async createReceipt(receiptData) {
    const receipts = getStoredItem('receipts', INITIAL_RECEIPTS);
    const newReceipt = {
      ...receiptData,
      id: `REC-2026-${String(receipts.length + 1).padStart(3, '0')}`,
      date: receiptData.date || new Date().toISOString().split('T')[0],
      status: receiptData.status || 'Draft'
    };
    const updated = [newReceipt, ...receipts];
    setStoredItem('receipts', updated);
    return mockApiCall(newReceipt);
  },

  async validateReceipt(id) {
    const receipts = getStoredItem('receipts', INITIAL_RECEIPTS);
    const index = receipts.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Receipt not found.');

    const receipt = receipts[index];
    if (receipt.status === 'Done') throw new Error('Receipt is already validated.');

    receipt.status = 'Done';
    receipts[index] = receipt;
    setStoredItem('receipts', receipts);

    // Update Product stock upwards
    const products = getStoredItem('products', INITIAL_PRODUCTS);
    const moves = getMoveHistoryFromStorage();

    if (Array.isArray(receipt.items)) {
      receipt.items.forEach((item) => {
        const prodIndex = products.findIndex((p) => p.id === item.productId);
        if (prodIndex !== -1) {
          const qty = Number(item.quantity) || 0;
          products[prodIndex].currentStock += qty;
          if (products[prodIndex].currentStock > products[prodIndex].minStock) {
            products[prodIndex].status = 'In Stock';
          }

          moves.unshift({
            id: `MOV-${Date.now()}-${Math.floor(Math.random()*100)}`,
            date: new Date().toISOString(),
            transactionId: receipt.id,
            productId: products[prodIndex].id,
            productName: products[prodIndex].name,
            sku: products[prodIndex].sku,
            action: 'Receipt',
            quantity: +qty,
            fromLocation: `Supplier (${receipt.supplier})`,
            toLocation: receipt.warehouseName || 'Warehouse',
            user: 'Alex Morgan',
            status: 'Done'
          });
        }
      });
    }

    setStoredItem('products', products);
    setStoredItem('move_history', moves);
    return mockApiCall(receipt);
  },

  // --- DELIVERIES ---
  async getDeliveries() {
    const data = getStoredItem('deliveries', INITIAL_DELIVERIES);
    return mockApiCall(data);
  },

  async createDelivery(deliveryData) {
    const deliveries = getStoredItem('deliveries', INITIAL_DELIVERIES);
    const newDelivery = {
      ...deliveryData,
      id: `DEL-2026-${String(deliveries.length + 100).padStart(3, '0')}`,
      date: deliveryData.date || new Date().toISOString().split('T')[0],
      status: deliveryData.status || 'Draft',
      workflowStep: 'Draft'
    };
    const updated = [newDelivery, ...deliveries];
    setStoredItem('deliveries', updated);
    return mockApiCall(newDelivery);
  },

  async validateDelivery(id) {
    const deliveries = getStoredItem('deliveries', INITIAL_DELIVERIES);
    const index = deliveries.findIndex((d) => d.id === id);
    if (index === -1) throw new Error('Delivery Order not found.');

    const delivery = deliveries[index];
    if (delivery.status === 'Done') throw new Error('Delivery is already validated.');

    delivery.status = 'Done';
    delivery.workflowStep = 'Validated';
    deliveries[index] = delivery;
    setStoredItem('deliveries', deliveries);

    // Update Product stock downwards
    const products = getStoredItem('products', INITIAL_PRODUCTS);
    const moves = getMoveHistoryFromStorage();

    if (Array.isArray(delivery.items)) {
      delivery.items.forEach((item) => {
        const prodIndex = products.findIndex((p) => p.id === item.productId);
        if (prodIndex !== -1) {
          const qty = Number(item.quantity) || 0;
          products[prodIndex].currentStock = Math.max(0, products[prodIndex].currentStock - qty);
          
          if (products[prodIndex].currentStock === 0) {
            products[prodIndex].status = 'Out of Stock';
          } else if (products[prodIndex].currentStock <= products[prodIndex].minStock) {
            products[prodIndex].status = 'Low Stock';
          }

          moves.unshift({
            id: `MOV-${Date.now()}-${Math.floor(Math.random()*100)}`,
            date: new Date().toISOString(),
            transactionId: delivery.id,
            productId: products[prodIndex].id,
            productName: products[prodIndex].name,
            sku: products[prodIndex].sku,
            action: 'Delivery',
            quantity: -qty,
            fromLocation: delivery.warehouseName || 'Warehouse',
            toLocation: `Customer (${delivery.customer})`,
            user: 'Alex Morgan',
            status: 'Done'
          });
        }
      });
    }

    setStoredItem('products', products);
    setStoredItem('move_history', moves);
    return mockApiCall(delivery);
  },

  // --- TRANSFERS ---
  async getTransfers() {
    const data = getStoredItem('transfers', INITIAL_TRANSFERS);
    return mockApiCall(data);
  },

  async createTransfer(transferData) {
    const transfers = getStoredItem('transfers', INITIAL_TRANSFERS);
    const newTransfer = {
      ...transferData,
      id: `TRF-2026-${String(transfers.length + 50).padStart(3, '0')}`,
      date: transferData.date || new Date().toISOString().split('T')[0],
      status: 'Done',
      transferredBy: 'Alex Morgan'
    };
    const updated = [newTransfer, ...transfers];
    setStoredItem('transfers', updated);

    // Record in move history
    const moves = getMoveHistoryFromStorage();
    moves.unshift({
      id: `MOV-${Date.now()}`,
      date: new Date().toISOString(),
      transactionId: newTransfer.id,
      productId: transferData.productId,
      productName: transferData.productName,
      sku: transferData.sku || 'SKU-TRF',
      action: 'Internal Transfer',
      quantity: Number(transferData.quantity),
      fromLocation: `${transferData.sourceWarehouseName} (${transferData.sourceLocation})`,
      toLocation: `${transferData.destinationWarehouseName} (${transferData.destinationLocation})`,
      user: 'Alex Morgan',
      status: 'Done'
    });
    setStoredItem('move_history', moves);

    return mockApiCall(newTransfer);
  },

  // --- ADJUSTMENTS ---
  async getAdjustments() {
    const data = getStoredItem('adjustments', INITIAL_ADJUSTMENTS);
    return mockApiCall(data);
  },

  async createAdjustment(adjData) {
    const adjustments = getStoredItem('adjustments', INITIAL_ADJUSTMENTS);
    const newAdj = {
      ...adjData,
      id: `ADJ-2026-${String(adjustments.length + 20).padStart(3, '0')}`,
      date: new Date().toISOString(),
      status: 'Applied',
      adjustedBy: 'Alex Morgan'
    };
    const updated = [newAdj, ...adjustments];
    setStoredItem('adjustments', updated);

    // Update product stock
    const products = getStoredItem('products', INITIAL_PRODUCTS);
    const prodIndex = products.findIndex((p) => p.id === adjData.productId);
    if (prodIndex !== -1) {
      products[prodIndex].currentStock = Number(adjData.physicalQty);
      if (products[prodIndex].currentStock === 0) products[prodIndex].status = 'Out of Stock';
      else if (products[prodIndex].currentStock <= products[prodIndex].minStock) products[prodIndex].status = 'Low Stock';
      else products[prodIndex].status = 'In Stock';
      setStoredItem('products', products);
    }

    // Ledger move entry
    const moves = getMoveHistoryFromStorage();
    moves.unshift({
      id: `MOV-${Date.now()}`,
      date: new Date().toISOString(),
      transactionId: newAdj.id,
      productId: adjData.productId,
      productName: adjData.productName,
      sku: adjData.sku || 'SKU-ADJ',
      action: 'Stock Adjustment',
      quantity: Number(adjData.difference),
      fromLocation: adjData.warehouseName || 'Warehouse',
      toLocation: `Adjustment (${adjData.reason})`,
      user: 'Alex Morgan',
      status: 'Done'
    });
    setStoredItem('move_history', moves);

    return mockApiCall(newAdj);
  },

  // --- MOVE HISTORY ---
  async getMoveHistory() {
    const moves = getMoveHistoryFromStorage();
    return mockApiCall(moves);
  }
};
