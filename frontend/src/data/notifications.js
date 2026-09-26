export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'Critical',
    title: 'Out of Stock Alert',
    message: 'Product "High-Precision Stainless Steel Ball Bearings 6204" (SKU-MECH-4105) has reached 0 stock in Delhi Depot.',
    timestamp: '10 mins ago',
    read: false,
    actionUrl: '/products/prod-004'
  },
  {
    id: 'notif-2',
    type: 'AI',
    title: 'Predicted Demand Spike Detected',
    message: 'AI Forecast predicts a +340% demand surge for "Smart IoT Temperature Sensors" over the next 14 days due to seasonal cold-chain contracts.',
    timestamp: '45 mins ago',
    read: false,
    actionUrl: '/ai/forecast'
  },
  {
    id: 'notif-3',
    type: 'Warning',
    title: 'Low Stock Threshold Reached',
    message: 'Product "Thermal Transfer Label Rolls" has 85 units remaining (Minimum threshold: 100).',
    timestamp: '2 hours ago',
    read: false,
    actionUrl: '/ai/reorder'
  },
  {
    id: 'notif-4',
    type: 'Information',
    title: 'Receipt REC-2026-001 Completed',
    message: '50 units of Wireless Barcode Scanners were received and verified in CDC Bengaluru.',
    timestamp: '1 day ago',
    read: true,
    actionUrl: '/operations/receipts'
  },
  {
    id: 'notif-5',
    type: 'AI',
    title: 'Inventory Anomaly Flagged',
    message: 'Unusual rapid depletion of 45 units of LiFePO4 Battery Packs detected outside regular order dispatch hours.',
    timestamp: '2 days ago',
    read: true,
    actionUrl: '/ai/anomalies'
  }
];
