export const AI_DEMAND_FORECASTS = [
  {
    productId: 'prod-002',
    productName: 'Smart IoT Temperature & Humidity Sensor',
    sku: 'SKU-COMP-2042',
    currentStock: 18,
    forecast7D: 42,
    forecast30D: 180,
    forecast3M: 520,
    confidence: '94.8%',
    trend: '+45%',
    historicalVsPredicted: [
      { date: 'Sep 1', historical: 12, predicted: 12 },
      { date: 'Sep 7', historical: 18, predicted: 16 },
      { date: 'Sep 14', historical: 25, predicted: 24 },
      { date: 'Sep 21', historical: 38, predicted: 36 },
      { date: 'Sep 28', historical: null, predicted: 50 },
      { date: 'Oct 5', historical: null, predicted: 68 },
      { date: 'Oct 12', historical: null, predicted: 85 },
    ],
    insights: 'Surge driven by new IoT expansion contract with cold chain logisticians. Immediate replenishment advised.'
  },
  {
    productId: 'prod-001',
    productName: 'Wireless Industrial Barcode Scanner X-200',
    sku: 'SKU-ELEC-1001',
    currentStock: 142,
    forecast7D: 28,
    forecast30D: 95,
    forecast3M: 280,
    confidence: '91.2%',
    trend: '+12%',
    historicalVsPredicted: [
      { date: 'Sep 1', historical: 20, predicted: 20 },
      { date: 'Sep 7', historical: 22, predicted: 22 },
      { date: 'Sep 14', historical: 28, predicted: 26 },
      { date: 'Sep 21', historical: 30, predicted: 29 },
      { date: 'Sep 28', historical: null, predicted: 32 },
      { date: 'Oct 5', historical: null, predicted: 35 },
      { date: 'Oct 12', historical: null, predicted: 38 },
    ],
    insights: 'Stable enterprise demand. Current stock levels sufficient for next 42 days.'
  },
  {
    productId: 'prod-004',
    productName: 'High-Precision Stainless Steel Ball Bearings 6204',
    sku: 'SKU-MECH-4105',
    currentStock: 0,
    forecast7D: 35,
    forecast30D: 120,
    forecast3M: 350,
    confidence: '96.5%',
    trend: '+65%',
    historicalVsPredicted: [
      { date: 'Sep 1', historical: 15, predicted: 15 },
      { date: 'Sep 7', historical: 25, predicted: 24 },
      { date: 'Sep 14', historical: 30, predicted: 28 },
      { date: 'Sep 21', historical: 35, predicted: 32 },
      { date: 'Sep 28', historical: null, predicted: 40 },
      { date: 'Oct 5', historical: null, predicted: 45 },
      { date: 'Oct 12', historical: null, predicted: 52 },
    ],
    insights: 'CRITICAL STOCKOUT! Assembly plants require 35 units per week. Restock immediately.'
  }
];

export const SMART_REORDER_ITEMS = [
  {
    id: 'reorder-1',
    productId: 'prod-004',
    productName: 'High-Precision Stainless Steel Ball Bearings 6204',
    sku: 'SKU-MECH-4105',
    supplier: 'Apex Precision Engineering',
    currentStock: 0,
    predicted30DDemand: 120,
    safetyStock: 30,
    recommendedOrder: 150,
    urgency: 'Critical',
    reason: 'Stockout active. Lead time is 4 days.'
  },
  {
    id: 'reorder-2',
    productId: 'prod-002',
    productName: 'Smart IoT Temperature & Humidity Sensor',
    sku: 'SKU-COMP-2042',
    supplier: 'SensTech Global',
    currentStock: 18,
    predicted30DDemand: 180,
    safetyStock: 50,
    recommendedOrder: 200,
    urgency: 'Critical',
    reason: 'Stock will deplete in 3 days based on current burn rate.'
  },
  {
    id: 'reorder-3',
    productId: 'prod-005',
    productName: 'Thermal Transfer Label Rolls (4x6 Inches)',
    sku: 'SKU-OFFC-5012',
    supplier: 'PrintPro Supplies',
    currentStock: 85,
    predicted30DDemand: 210,
    safetyStock: 100,
    recommendedOrder: 250,
    urgency: 'High',
    reason: 'Below minimum stock threshold.'
  },
  {
    id: 'reorder-4',
    productId: 'prod-008',
    productName: 'Biodegradable Bubble Wrap Rolls (50m)',
    sku: 'SKU-PACK-8819',
    supplier: 'EcoPack Industries',
    currentStock: 12,
    predicted30DDemand: 75,
    safetyStock: 40,
    recommendedOrder: 100,
    urgency: 'Medium',
    reason: 'Upcoming packing surge expected in Delhi Depot.'
  }
];

export const ANOMALY_DETECTIONS = [
  {
    id: 'anom-1',
    productId: 'prod-007',
    productName: 'Rechargeable LiFePO4 Battery Pack 12V 50Ah',
    sku: 'SKU-ELEC-7102',
    detectedQty: 45,
    normalRange: '5 - 15 units / day',
    date: '2026-09-24',
    severity: 'High',
    status: 'Unreviewed',
    notes: 'Sudden spike of 45 units dispatched in a single batch without linked sales order ID.'
  },
  {
    id: 'anom-2',
    productId: 'prod-003',
    productName: 'Heavy-Duty Corrugated Shipping Boxes',
    sku: 'SKU-PACK-3009',
    detectedQty: 520,
    normalRange: '100 - 250 units / week',
    date: '2026-09-22',
    severity: 'Medium',
    status: 'Reviewed',
    notes: 'Bulk stock arrival higher than purchase order quantity (+30%). Verified as promotional vendor extra.'
  }
];

export const AI_RECOMMENDATIONS = [
  {
    id: 'rec-1',
    type: 'Reorder',
    title: 'Emergency Restock for Ball Bearings 6204',
    impact: 'High Impact',
    badgeColor: 'red',
    description: 'Stock is 0. Estimated lost revenue ₹35,000/day if manufacturing line pauses. Place order of 150 units with Apex Precision.',
    actionText: 'Generate Reorder Request',
    actionType: 'REORDER_ITEM',
    productId: 'prod-004'
  },
  {
    id: 'rec-2',
    type: 'Move Stock',
    title: 'Rebalance Corrugated Shipping Boxes',
    impact: 'Medium Impact',
    badgeColor: 'blue',
    description: 'Mumbai Hub holds 520 units (Overstock +160%), while Delhi Depot faces shortage. Transfer 150 boxes from Mumbai to Delhi.',
    actionText: 'Create Internal Transfer',
    actionType: 'TRANSFER_STOCK',
    productId: 'prod-003'
  },
  {
    id: 'rec-3',
    type: 'Increase Safety Stock',
    title: 'Raise Min Stock for IoT Sensors',
    impact: 'Medium Impact',
    badgeColor: 'orange',
    description: 'Demand volatility increased by 40%. Recommend adjusting Minimum Stock from 50 to 80 units to prevent stockouts.',
    actionText: 'Update Product Min Stock',
    actionType: 'UPDATE_MIN_STOCK',
    productId: 'prod-002'
  },
  {
    id: 'rec-4',
    type: 'Investigate Anomaly',
    title: 'Review Battery Pack Dispatch',
    impact: 'High Impact',
    badgeColor: 'red',
    description: '45 battery units were moved out without automated scanning log on Sep 24. Audit CDC Bengaluru Zone C.',
    actionText: 'Audit Movement Log',
    actionType: 'AUDIT_ANOMALY',
    productId: 'prod-007'
  }
];
