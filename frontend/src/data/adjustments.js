export const INITIAL_ADJUSTMENTS = [
  {
    id: 'ADJ-2026-015',
    productId: 'prod-002',
    productName: 'Smart IoT Temperature & Humidity Sensor',
    warehouseId: 'wh-1',
    warehouseName: 'Central Distribution Center (Bengaluru)',
    storageLocation: 'Rack B-04, Shelf 1',
    systemQty: 22,
    physicalQty: 18,
    difference: -4,
    reason: 'Damaged during forklift movement',
    adjustedBy: 'Alex Morgan',
    date: '2026-09-25T11:00:00Z',
    status: 'Applied'
  },
  {
    id: 'ADJ-2026-014',
    productId: 'prod-010',
    productName: 'Industrial Cut-Resistant Gloves (Level 5)',
    warehouseId: 'wh-1',
    warehouseName: 'Central Distribution Center (Bengaluru)',
    storageLocation: 'Rack D-03, Shelf 4',
    systemQty: 625,
    physicalQty: 640,
    difference: +15,
    reason: 'Unrecorded box found during physical audit',
    adjustedBy: 'Vikram Singh',
    date: '2026-09-21T15:30:00Z',
    status: 'Applied'
  }
];
