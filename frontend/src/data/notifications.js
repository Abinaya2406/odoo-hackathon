export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-pred-1',
    type: 'Stockout Prediction',
    title: '🔮 Stockout Prediction',
    message: 'Steel Rod is predicted to reach critical stock in 6 days based on elevated consumption.',
    timestamp: '15 mins ago',
    read: false,
    actionUrl: '/ai/stockout-prediction?product=SR-001'
  },
  {
    id: 'notif-anom-1',
    type: 'Inventory Anomaly',
    title: '🚨 Anomaly Detected',
    message: 'Unusual stock movement detected for Steel Rod: 150 kg issue logged (+275% above normal pattern).',
    timestamp: '30 mins ago',
    read: false,
    actionUrl: '/ai/anomalies?product=SR-001'
  },
  {
    id: 'notif-pred-2',
    type: 'Critical Stock Prediction',
    title: '🔮 Critical Stockout Hazard',
    message: 'Industrial Copper Wire 2.5mm is estimated to deplete in 4 days. Lead time is 4 days.',
    timestamp: '1 hour ago',
    read: false,
    actionUrl: '/ai/stockout-prediction?product=CW-002'
  },
  {
    id: 'notif-ai-reco',
    type: 'AI Recommendation',
    title: '🧠 AI Recommendation',
    message: '3 products require attention today. Emergency restock advised for Ball Bearings.',
    timestamp: '2 hours ago',
    read: false,
    actionUrl: '/ai'
  },
  {
    id: 'notif-1',
    type: 'Critical',
    title: 'Out of Stock Alert',
    message: 'Product "High-Precision Stainless Steel Ball Bearings 6204" (SKU-MECH-4105) has reached 0 stock in Delhi Depot.',
    timestamp: '3 hours ago',
    read: true,
    actionUrl: '/products/prod-004'
  },
  {
    id: 'notif-4',
    type: 'Information',
    title: 'Receipt REC-2026-001 Completed',
    message: '50 units of Wireless Barcode Scanners were received and verified in CDC Bengaluru.',
    timestamp: '1 day ago',
    read: true,
    actionUrl: '/operations/receipts'
  }
];
