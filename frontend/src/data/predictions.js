/**
 * StockSense - AI Stockout Prediction Mock Dataset
 * Formatted for easy transition to GET /api/ai/stockout-predictions
 */

export const STOCKOUT_PREDICTIONS = [
  {
    id: 'pred-001',
    productId: 'prod-sr-001',
    productName: 'Steel Rod 12mm TMT',
    sku: 'SR-001',
    category: 'Raw Materials / Construction',
    warehouse: 'Main Warehouse (Bengaluru)',
    currentStock: 180,
    unit: 'kg',
    unitPrice: 75,
    avgDailyUsage: 30, // 30 kg/day
    predictedStockoutDays: 6,
    predictedStockoutDate: '2026-10-02',
    riskLevel: 'High', // Critical | High | Medium | Low
    confidence: '91%',
    safetyStock: 60,
    reorderLevel: 90,
    leadTimeDays: 5,
    supplierName: 'Jindal Steel & Power Ltd.',
    supplierContact: 'orders@jindalsteel.example.com',
    recommendedAction: 'Trigger Emergency PO of 500 kg',
    incomingShipment: null, // No incoming receipt
    reasons: [
      'Recent daily consumption increased by 22% over past 10 days',
      'Current stock (180 kg) is projected below safety stock (60 kg) in 4 days',
      'Supplier lead time is 5 days, leaving only 1 buffer day before stockout',
      'No incoming purchase receipt or delivery is currently scheduled'
    ],
    historicalVsPredicted: [
      { day: 'Day -10', historical: 480, predicted: null, safetyLine: 60 },
      { day: 'Day -8', historical: 420, predicted: null, safetyLine: 60 },
      { day: 'Day -6', historical: 360, predicted: null, safetyLine: 60 },
      { day: 'Day -4', historical: 300, predicted: null, safetyLine: 60 },
      { day: 'Day -2', historical: 240, predicted: null, safetyLine: 60 },
      { day: 'Today', historical: 180, predicted: 180, safetyLine: 60 },
      { day: 'Day +2', historical: null, predicted: 120, safetyLine: 60 },
      { day: 'Day +4', historical: null, predicted: 60, safetyLine: 60 },
      { day: 'Day +6 (Stockout)', historical: null, predicted: 0, safetyLine: 60 },
      { day: 'Day +8', historical: null, predicted: 0, safetyLine: 60 }
    ]
  },
  {
    id: 'pred-002',
    productId: 'prod-cw-002',
    productName: 'Industrial Copper Wire 2.5mm',
    sku: 'CW-002',
    category: 'Electrical Components',
    warehouse: 'West Regional Hub (Mumbai)',
    currentStock: 45,
    unit: 'coils',
    unitPrice: 1250,
    avgDailyUsage: 11, // 11 coils/day
    predictedStockoutDays: 4,
    predictedStockoutDate: '2026-09-30',
    riskLevel: 'Critical',
    confidence: '95%',
    safetyStock: 25,
    reorderLevel: 50,
    leadTimeDays: 4,
    supplierName: 'Polycab Electricals',
    supplierContact: 'procurement@polycab.example.com',
    recommendedAction: 'Immediate Expedited Reorder (100 coils)',
    incomingShipment: null,
    reasons: [
      'High order velocity from assembly line #3',
      'Stock reaches zero exactly at supplier lead time threshold',
      'Critical risk score based on high demand volatility (+35%)',
      'Zero pending purchase orders detected in system ledger'
    ],
    historicalVsPredicted: [
      { day: 'Day -8', historical: 133, predicted: null, safetyLine: 25 },
      { day: 'Day -6', historical: 111, predicted: null, safetyLine: 25 },
      { day: 'Day -4', historical: 89, predicted: null, safetyLine: 25 },
      { day: 'Day -2', historical: 67, predicted: null, safetyLine: 25 },
      { day: 'Today', historical: 45, predicted: 45, safetyLine: 25 },
      { day: 'Day +2', historical: null, predicted: 23, safetyLine: 25 },
      { day: 'Day +4 (Stockout)', historical: null, predicted: 0, safetyLine: 25 },
      { day: 'Day +6', historical: null, predicted: 0, safetyLine: 25 }
    ]
  },
  {
    id: 'pred-003',
    productId: 'prod-004',
    productName: 'Deep Groove Ball Bearings 6204',
    sku: 'SKU-MECH-4105',
    category: 'Industrial Machinery',
    warehouse: 'North Fulfillment Depot (Delhi NCR)',
    currentStock: 0,
    unit: 'Boxes (10 pcs)',
    unitPrice: 890,
    avgDailyUsage: 7,
    predictedStockoutDays: 0,
    predictedStockoutDate: '2026-09-26',
    riskLevel: 'Critical',
    confidence: '99%',
    safetyStock: 30,
    reorderLevel: 50,
    leadTimeDays: 3,
    supplierName: 'Apex Precision Engineering',
    supplierContact: 'supply@apexeng.example.com',
    recommendedAction: 'Emergency Stock In / Transfer from Mumbai',
    incomingShipment: 'PO-2026-088 (Pending delivery in 2 days)',
    reasons: [
      'Product currently has zero available stock in North Depot',
      'Pending supplier order PO-2026-088 due in 48 hours',
      'Unfulfilled backorders causing manufacturing bottleneck',
      'Rebalance transfer of 20 boxes from Mumbai hub recommended'
    ],
    historicalVsPredicted: [
      { day: 'Day -10', historical: 70, predicted: null, safetyLine: 30 },
      { day: 'Day -8', historical: 56, predicted: null, safetyLine: 30 },
      { day: 'Day -6', historical: 42, predicted: null, safetyLine: 30 },
      { day: 'Day -4', historical: 28, predicted: null, safetyLine: 30 },
      { day: 'Day -2', historical: 14, predicted: null, safetyLine: 30 },
      { day: 'Today', historical: 0, predicted: 0, safetyLine: 30 },
      { day: 'Day +2 (PO Arrival)', historical: null, predicted: 50, safetyLine: 30 },
      { day: 'Day +4', historical: null, predicted: 36, safetyLine: 30 }
    ]
  },
  {
    id: 'pred-004',
    productId: 'prod-002',
    productName: 'Smart IoT Temperature & Humidity Sensor',
    sku: 'SKU-COMP-2042',
    category: 'Electronics & Sensors',
    warehouse: 'Main Warehouse (Bengaluru)',
    currentStock: 18,
    unit: 'Units',
    unitPrice: 1850,
    avgDailyUsage: 3,
    predictedStockoutDays: 6,
    predictedStockoutDate: '2026-10-02',
    riskLevel: 'High',
    confidence: '88%',
    safetyStock: 20,
    reorderLevel: 35,
    leadTimeDays: 7,
    supplierName: 'SensTech Global',
    supplierContact: 'contact@senstech.example.com',
    recommendedAction: 'Place Reorder of 60 Units',
    incomingShipment: null,
    reasons: [
      'Current stock (18 units) has dropped below safety stock (20 units)',
      'Lead time of 7 days exceeds the 6-day stockout window',
      'Cold-chain expansion project accelerating rollout pace',
      'Potential stockout penalty from client SLA'
    ],
    historicalVsPredicted: [
      { day: 'Day -8', historical: 42, predicted: null, safetyLine: 20 },
      { day: 'Day -6', historical: 36, predicted: null, safetyLine: 20 },
      { day: 'Day -4', historical: 30, predicted: null, safetyLine: 20 },
      { day: 'Day -2', historical: 24, predicted: null, safetyLine: 20 },
      { day: 'Today', historical: 18, predicted: 18, safetyLine: 20 },
      { day: 'Day +2', historical: null, predicted: 12, safetyLine: 20 },
      { day: 'Day +4', historical: null, predicted: 6, safetyLine: 20 },
      { day: 'Day +6 (Stockout)', historical: null, predicted: 0, safetyLine: 20 }
    ]
  },
  {
    id: 'pred-005',
    productId: 'prod-008',
    productName: 'Biodegradable Bubble Wrap Rolls (50m)',
    sku: 'SKU-PACK-8819',
    category: 'Packaging & Shipping',
    warehouse: 'North Fulfillment Depot (Delhi NCR)',
    currentStock: 12,
    unit: 'Rolls',
    unitPrice: 650,
    avgDailyUsage: 1.5,
    predictedStockoutDays: 8,
    predictedStockoutDate: '2026-10-04',
    riskLevel: 'Medium',
    confidence: '84%',
    safetyStock: 15,
    reorderLevel: 30,
    leadTimeDays: 4,
    supplierName: 'EcoPack Industries',
    supplierContact: 'orders@ecopack.example.com',
    recommendedAction: 'Standard Restock Order (50 Rolls)',
    incomingShipment: null,
    reasons: [
      'Stock slightly below 15-roll safety threshold',
      'Lead time is 4 days, providing sufficient response window if PO placed now',
      'Upcoming month-end packing rush may double daily consumption',
      'No critical downstream equipment dependency'
    ],
    historicalVsPredicted: [
      { day: 'Day -8', historical: 24, predicted: null, safetyLine: 15 },
      { day: 'Day -6', historical: 21, predicted: null, safetyLine: 15 },
      { day: 'Day -4', historical: 18, predicted: null, safetyLine: 15 },
      { day: 'Day -2', historical: 15, predicted: null, safetyLine: 15 },
      { day: 'Today', historical: 12, predicted: 12, safetyLine: 15 },
      { day: 'Day +2', historical: null, predicted: 9, safetyLine: 15 },
      { day: 'Day +4', historical: null, predicted: 6, safetyLine: 15 },
      { day: 'Day +6', historical: null, predicted: 3, safetyLine: 15 },
      { day: 'Day +8 (Stockout)', historical: null, predicted: 0, safetyLine: 15 }
    ]
  },
  {
    id: 'pred-006',
    productId: 'prod-005',
    productName: 'Thermal Transfer Label Rolls (4x6 Inches)',
    sku: 'SKU-OFFC-5012',
    category: 'Office & Admin',
    warehouse: 'Main Warehouse (Bengaluru)',
    currentStock: 85,
    unit: 'Rolls',
    unitPrice: 340,
    avgDailyUsage: 8,
    predictedStockoutDays: 11,
    predictedStockoutDate: '2026-10-07',
    riskLevel: 'Medium',
    confidence: '86%',
    safetyStock: 50,
    reorderLevel: 80,
    leadTimeDays: 3,
    supplierName: 'PrintPro Supplies',
    supplierContact: 'support@printpro.example.com',
    recommendedAction: 'Plan Routine Replenishment (100 Rolls)',
    incomingShipment: null,
    reasons: [
      'Comfortable safety stock buffer for next 4 days',
      'Short supplier lead time (3 days) enables lean inventory handling',
      'Stable predictable demand pattern over last 60 days',
      'Monitor against packing volume spikes'
    ],
    historicalVsPredicted: [
      { day: 'Day -8', historical: 149, predicted: null, safetyLine: 50 },
      { day: 'Day -6', historical: 133, predicted: null, safetyLine: 50 },
      { day: 'Day -4', historical: 117, predicted: null, safetyLine: 50 },
      { day: 'Day -2', historical: 101, predicted: null, safetyLine: 50 },
      { day: 'Today', historical: 85, predicted: 85, safetyLine: 50 },
      { day: 'Day +3', historical: null, predicted: 61, safetyLine: 50 },
      { day: 'Day +6', historical: null, predicted: 37, safetyLine: 50 },
      { day: 'Day +9', historical: null, predicted: 13, safetyLine: 50 },
      { day: 'Day +11 (Stockout)', historical: null, predicted: 0, safetyLine: 50 }
    ]
  },
  {
    id: 'pred-007',
    productId: 'prod-001',
    productName: 'Wireless Industrial Barcode Scanner X-200',
    sku: 'SKU-ELEC-1001',
    category: 'Electronics & Sensors',
    warehouse: 'Main Warehouse (Bengaluru)',
    currentStock: 142,
    unit: 'Units',
    unitPrice: 4500,
    avgDailyUsage: 4,
    predictedStockoutDays: 35,
    predictedStockoutDate: '2026-10-31',
    riskLevel: 'Low',
    confidence: '93%',
    safetyStock: 30,
    reorderLevel: 50,
    leadTimeDays: 5,
    supplierName: 'LogiTech Solutions',
    supplierContact: 'sales@logitechsol.example.com',
    recommendedAction: 'Healthy Stock - No Action Needed',
    incomingShipment: null,
    reasons: [
      'Healthy inventory reserve exceeding 30 days of standard operations',
      'Well above 30-unit safety threshold',
      'Reliable supplier lead time and steady demand velocity',
      'Next scheduled review in 18 days'
    ],
    historicalVsPredicted: [
      { day: 'Day -8', historical: 174, predicted: null, safetyLine: 30 },
      { day: 'Day -4', historical: 158, predicted: null, safetyLine: 30 },
      { day: 'Today', historical: 142, predicted: 142, safetyLine: 30 },
      { day: 'Day +10', historical: null, predicted: 102, safetyLine: 30 },
      { day: 'Day +20', historical: null, predicted: 62, safetyLine: 30 },
      { day: 'Day +30', historical: null, predicted: 22, safetyLine: 30 },
      { day: 'Day +35 (Stockout)', historical: null, predicted: 0, safetyLine: 30 }
    ]
  }
];

export const PREDICTION_KPIS = {
  productsAtRisk: 5,
  stockoutsPredicted: 4,
  criticalProducts: 2,
  avgDaysToStockout: 7.2
};
