export const INITIAL_WAREHOUSES = [
  {
    id: 'wh-1',
    code: 'WH-BLR-01',
    name: 'Central Distribution Center (Bengaluru)',
    location: 'Electronic City Phase 1, Bengaluru',
    manager: 'Rajesh Sharma',
    totalProducts: 850,
    totalQuantity: 28400,
    capacity: 35000,
    status: 'Active',
    zones: ['Zone A (High Velocity)', 'Zone B (Bulk Storage)', 'Zone C (Cold Storage)', 'Zone D (Staging)']
  },
  {
    id: 'wh-2',
    code: 'WH-BOM-02',
    name: 'West Regional Hub (Mumbai)',
    location: 'Bhiwandi Logistics Hub, Mumbai',
    manager: 'Priya Mehta',
    totalProducts: 420,
    totalQuantity: 12500,
    capacity: 20000,
    status: 'Active',
    zones: ['Zone A (Pallets)', 'Zone B (Small Items)', 'Zone C (Returns)']
  },
  {
    id: 'wh-3',
    code: 'WH-DEL-03',
    name: 'North Fulfillment Depot (Delhi NCR)',
    location: 'Gurugram Industrial Area, Delhi NCR',
    manager: 'Vikram Singh',
    totalProducts: 310,
    totalQuantity: 8020,
    capacity: 15000,
    status: 'Active',
    zones: ['Zone A (Fast Moving)', 'Zone B (Overstock)']
  }
];
