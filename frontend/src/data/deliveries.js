export const INITIAL_DELIVERIES = [
  {
    id: 'DEL-2026-089',
    customer: 'Apex Auto Assembly Ltd.',
    warehouseId: 'wh-1',
    warehouseName: 'Central Distribution Center (Bengaluru)',
    date: '2026-09-24',
    status: 'Done',
    workflowStep: 'Validated', // Picked -> Packed -> Validated
    items: [
      { productId: 'prod-001', productName: 'Wireless Industrial Barcode Scanner X-200', quantity: 15, unitPrice: 5200 },
      { productId: 'prod-010', productName: 'Industrial Cut-Resistant Gloves (Level 5)', quantity: 50, unitPrice: 320 }
    ]
  },
  {
    id: 'DEL-2026-090',
    customer: 'FastFreight Logistics Pvt Ltd',
    warehouseId: 'wh-2',
    warehouseName: 'West Regional Hub (Mumbai)',
    date: '2026-09-25',
    status: 'Ready',
    workflowStep: 'Packed',
    items: [
      { productId: 'prod-003', productName: 'Heavy-Duty Corrugated Shipping Boxes (30x20x20")', quantity: 100, unitPrice: 1400 },
      { productId: 'prod-006', productName: 'ANSI Class 2 High-Visibility Safety Vests', quantity: 40, unitPrice: 490 }
    ]
  },
  {
    id: 'DEL-2026-091',
    customer: 'OmniRetail Online Outlets',
    warehouseId: 'wh-1',
    warehouseName: 'Central Distribution Center (Bengaluru)',
    date: '2026-09-26',
    status: 'Waiting',
    workflowStep: 'Picking',
    items: [
      { productId: 'prod-007', productName: 'Rechargeable LiFePO4 Battery Pack 12V 50Ah', quantity: 5, unitPrice: 14200 }
    ]
  },
  {
    id: 'DEL-2026-092',
    customer: 'Metro Infra Tech',
    warehouseId: 'wh-3',
    warehouseName: 'North Fulfillment Depot (Delhi NCR)',
    date: '2026-09-26',
    status: 'Draft',
    workflowStep: 'Draft',
    items: [
      { productId: 'prod-008', productName: 'Biodegradable Bubble Wrap Rolls (50m)', quantity: 10, unitPrice: 750 }
    ]
  }
];
