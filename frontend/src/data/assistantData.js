/**
 * StockSense - Natural Language Inventory Assistant Mock Knowledge Base & Intents
 * Formatted for easy transition to POST /api/ai/assistant
 */

export const SUGGESTED_QUESTIONS = [
  'Which products may run out this week?',
  'Show products with critical stock.',
  'Which products had unusual stock movements?',
  'How much Steel Rod is available?',
  'Which warehouse has the highest stock?',
  'Show products with declining demand.',
  'Which products need immediate attention?'
];

export const PRESET_INTENT_RESPONSES = [
  {
    id: 'intent-stockout-week',
    triggers: [
      'which products may run out this week',
      'run out this week',
      'run out in the next 7 days',
      'run out in 7 days',
      'deplete this week',
      'stockout this week',
      'products running out'
    ],
    response: {
      text: 'Based on recent consumption patterns and machine learning forecast models, 3 products are predicted to reach critical stock or complete stockout within the next 7 days:',
      type: 'product_cards',
      products: [
        {
          id: 'prod-sr-001',
          name: 'Steel Rod 12mm TMT',
          sku: 'SR-001',
          stock: '180 kg',
          burnRate: '30 kg/day',
          daysRemaining: 6,
          risk: 'High',
          badgeColor: 'amber',
          warehouse: 'Main Warehouse (Bengaluru)',
          actionUrl: '/ai/stockout-prediction?product=SR-001',
          productUrl: '/products/prod-001'
        },
        {
          id: 'prod-cw-002',
          name: 'Industrial Copper Wire 2.5mm',
          sku: 'CW-002',
          stock: '45 coils',
          burnRate: '11 coils/day',
          daysRemaining: 4,
          risk: 'Critical',
          badgeColor: 'rose',
          warehouse: 'West Regional Hub (Mumbai)',
          actionUrl: '/ai/stockout-prediction?product=CW-002',
          productUrl: '/products/prod-002'
        },
        {
          id: 'prod-004',
          name: 'Deep Groove Ball Bearings 6204',
          sku: 'SKU-MECH-4105',
          stock: '0 Boxes',
          burnRate: '7 boxes/day',
          daysRemaining: 0,
          risk: 'Critical',
          badgeColor: 'rose',
          warehouse: 'North Fulfillment Depot (Delhi NCR)',
          actionUrl: '/ai/stockout-prediction?product=SKU-MECH-4105',
          productUrl: '/products/prod-004'
        }
      ],
      recommendation: 'Immediate action advised: Trigger expedited purchase order for Copper Wire and arrange internal transfer for Ball Bearings.'
    }
  },
  {
    id: 'intent-critical-stock',
    triggers: [
      'show products with critical stock',
      'critical stock',
      'out of stock products',
      'low stock items',
      'critical products'
    ],
    response: {
      text: 'Here are the products currently below their configured safety thresholds or at 0 stock across all facilities:',
      type: 'warning_card',
      title: 'Active Safety Threshold Breaches',
      severity: 'Critical',
      items: [
        { name: 'Deep Groove Ball Bearings 6204', sku: 'SKU-MECH-4105', stock: '0 Boxes (Safety: 30)', status: 'Out of Stock' },
        { name: 'Pneumatic Conveyor Cylinder', sku: 'SKU-MECH-9003', stock: '0 Units (Safety: 10)', status: 'Out of Stock' },
        { name: 'Biodegradable Bubble Wrap Rolls', sku: 'SKU-PACK-8819', stock: '12 Rolls (Safety: 15)', status: 'Critical Low' },
        { name: 'Smart IoT Temperature Sensor', sku: 'SKU-COMP-2042', stock: '18 Units (Safety: 20)', status: 'Critical Low' }
      ],
      actions: [
        { label: 'View Stockout Predictions', url: '/ai/stockout-prediction' },
        { label: 'Open Smart Reorders', url: '/ai/reorder' }
      ]
    }
  },
  {
    id: 'intent-anomalies',
    triggers: [
      'which products had unusual stock movements',
      'unusual stock movements',
      'anomalies',
      'detect anomalies',
      'unusual movements',
      'suspicious activity'
    ],
    response: {
      text: 'AI Watchdog flagged 4 unusual movement events over the past 72 hours requiring managerial review:',
      type: 'anomaly_list',
      anomalies: [
        {
          product: 'Steel Rod 12mm TMT (SR-001)',
          eventType: 'Unusual stock issue',
          expected: '10 – 40 kg',
          actual: '150 kg (+275% spike)',
          severity: 'High',
          warehouse: 'Main Warehouse',
          time: 'Today 10:14 AM'
        },
        {
          product: 'Rechargeable LiFePO4 Battery Pack (SKU-ELEC-7102)',
          eventType: 'Sudden stock decrease',
          expected: '2 – 8 units / day',
          actual: '45 units unlinked shift',
          severity: 'Critical',
          warehouse: 'Main Warehouse',
          time: 'Sep 24, 07:45 PM'
        },
        {
          product: 'Industrial Copper Wire (CW-002)',
          eventType: 'Unusual stock receipt',
          expected: '20 – 50 coils',
          actual: '200 coils (+300% PO excess)',
          severity: 'Medium',
          warehouse: 'West Regional Hub',
          time: 'Sep 25, 04:30 PM'
        }
      ],
      action: { label: 'Review All in Anomaly Detective', url: '/ai/anomalies' }
    }
  },
  {
    id: 'intent-steel-rod',
    triggers: [
      'how much steel rod is available',
      'steel rod stock',
      'steel rod',
      'sr-001',
      'check steel rod'
    ],
    response: {
      text: 'Inventory status for **Steel Rod 12mm TMT (SR-001)**:',
      type: 'product_detail',
      product: {
        name: 'Steel Rod 12mm TMT',
        sku: 'SR-001',
        totalStock: '180 kg',
        warehouse: 'Main Warehouse (Bengaluru) — Aisle B-04, Rack 2',
        status: 'Healthy (Depleting Fast)',
        burnRate: '30 kg / day',
        predictedStockout: '6 days remaining (Oct 02, 2026)',
        lastMovement: 'Stock Out of 150 kg (Flagged as Anomaly today 10:14 AM)',
        supplier: 'Jindal Steel & Power Ltd.'
      },
      actions: [
        { label: 'View Stockout Trajectory', url: '/ai/stockout-prediction?product=SR-001' },
        { label: 'Inspect Anomaly', url: '/ai/anomalies?product=SR-001' },
        { label: 'Scan Barcode', url: '/scanner?code=SR-001' }
      ]
    }
  },
  {
    id: 'intent-warehouse-stock',
    triggers: [
      'which warehouse has the highest stock',
      'highest stock',
      'warehouse capacity',
      'warehouse stock',
      'compare warehouses'
    ],
    response: {
      text: 'Analysis of stock distribution and capacity utilization across all 3 active fulfillment hubs:',
      type: 'warehouse_table',
      warehouses: [
        {
          name: 'Central Distribution Center (Bengaluru)',
          code: 'CDC-BLR',
          units: '28,400 Units',
          capacity: '35,000 Units',
          utilization: '81.1%',
          status: 'Optimal',
          topItem: 'Electronics & Raw Steel'
        },
        {
          name: 'West Regional Hub (Mumbai)',
          code: 'WRH-BOM',
          units: '12,500 Units',
          capacity: '20,000 Units',
          utilization: '62.5%',
          status: 'Healthy Buffer',
          topItem: 'Packaging & Copper Wire'
        },
        {
          name: 'North Fulfillment Depot (Delhi NCR)',
          code: 'NFD-DEL',
          units: '8,020 Units',
          capacity: '15,000 Units',
          utilization: '53.4%',
          status: 'Capacity Available',
          topItem: 'Safety & Industrial Spare Parts'
        }
      ],
      recommendation: 'Bengaluru CDC holds 58% of total network inventory. Consider balancing regional safety reserves.'
    }
  },
  {
    id: 'intent-declining-demand',
    triggers: [
      'show products with declining demand',
      'declining demand',
      'slow moving',
      'demand decrease',
      'falling demand'
    ],
    response: {
      text: 'AI demand forecasting identified 2 items with significant downward velocity trends (-20% or more):',
      type: 'declining_demand',
      items: [
        {
          name: 'Thermal Transfer Label Rolls (4x6 Inches)',
          sku: 'SKU-OFFC-5012',
          trend: '-28% demand contraction',
          currentStock: '85 Rolls',
          recommendedAction: 'Reduce incoming batch size from 250 to 100 rolls to avoid holding cost.'
        },
        {
          name: 'Heavy-Duty Corrugated Shipping Boxes',
          sku: 'SKU-PACK-3009',
          trend: '-19% regional shift',
          currentStock: '520 Packs in Mumbai',
          recommendedAction: 'Transfer 150 packs to Delhi depot to meet seasonal fulfillment.'
        }
      ]
    }
  },
  {
    id: 'intent-immediate-attention',
    triggers: [
      'which products need immediate attention',
      'immediate attention',
      'urgent items',
      'what needs attention',
      'priority products'
    ],
    response: {
      text: 'Summary of top 3 high-priority inventory vulnerabilities requiring supervisory intervention today:',
      type: 'priority_summary',
      items: [
        {
          priority: 'P1 - Immediate',
          badgeColor: 'rose',
          title: 'Ball Bearings 6204 at Zero Stock',
          detail: '0 boxes available in Delhi. Assembly line holds backorders. Restock or transfer immediately.'
        },
        {
          priority: 'P1 - Immediate',
          badgeColor: 'rose',
          title: 'Copper Wire 2.5mm Depleting in 4 Days',
          detail: 'Only 45 coils remaining against an 11 coils/day consumption rate. Lead time is 4 days.'
        },
        {
          priority: 'P2 - Audit Alert',
          badgeColor: 'amber',
          title: 'Unreviewed 150 kg Steel Rod Issue Anomaly',
          detail: 'Flagged transaction TXN-DEL-9082 exceeds standard threshold by 275%.'
        }
      ],
      quickLinks: [
        { label: 'View Stockout Engine', url: '/ai/stockout-prediction' },
        { label: 'Audit Anomalies', url: '/ai/anomalies' },
        { label: 'Launch Barcode Scanner', url: '/scanner' }
      ]
    }
  }
];
