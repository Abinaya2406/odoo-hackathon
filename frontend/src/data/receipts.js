export const INITIAL_RECEIPTS = [
  {
    id: 'REC-2026-001',
    supplier: 'LogiTech Solutions',
    warehouseId: 'wh-1',
    warehouseName: 'Central Distribution Center (Bengaluru)',
    date: '2026-09-22',
    status: 'Done',
    notes: 'Quarterly barcode scanner replenishment order.',
    items: [
      { productId: 'prod-001', productName: 'Wireless Industrial Barcode Scanner X-200', quantity: 50, unitPrice: 4500 }
    ]
  },
  {
    id: 'REC-2026-002',
    supplier: 'SensTech Global',
    warehouseId: 'wh-1',
    warehouseName: 'Central Distribution Center (Bengaluru)',
    date: '2026-09-25',
    status: 'Waiting',
    notes: 'Urgent IoT temperature sensors for new cold store unit.',
    items: [
      { productId: 'prod-002', productName: 'Smart IoT Temperature & Humidity Sensor', quantity: 100, unitPrice: 1850 }
    ]
  },
  {
    id: 'REC-2026-003',
    supplier: 'EcoPack Industries',
    warehouseId: 'wh-2',
    warehouseName: 'West Regional Hub (Mumbai)',
    date: '2026-09-24',
    status: 'Ready',
    notes: 'Monthly packaging cartons delivery.',
    items: [
      { productId: 'prod-003', productName: 'Heavy-Duty Corrugated Shipping Boxes (30x20x20")', quantity: 200, unitPrice: 1200 }
    ]
  },
  {
    id: 'REC-2026-004',
    supplier: 'Apex Precision Engineering',
    warehouseId: 'wh-3',
    warehouseName: 'North Fulfillment Depot (Delhi NCR)',
    date: '2026-09-26',
    status: 'Draft',
    notes: 'Restock order for out of stock ball bearings.',
    items: [
      { productId: 'prod-004', productName: 'High-Precision Stainless Steel Ball Bearings 6204', quantity: 80, unitPrice: 890 }
    ]
  }
];
