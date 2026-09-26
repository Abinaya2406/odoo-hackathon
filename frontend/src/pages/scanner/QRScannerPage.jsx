import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { formatCurrency } from '../../utils/formatters';
import {
  ScanLine,
  Camera,
  Search,
  CheckCircle2,
  FileCheck,
  Truck,
  RefreshCw,
  ListFilter,
  Package
} from 'lucide-react';

export const QRScannerPage = () => {
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [scanning, setScanning] = useState(false);
  const [skuQuery, setSkuQuery] = useState('');
  const [scannedProduct, setScannedProduct] = useState(null);

  const handleSimulateScan = async () => {
    setScanning(true);
    setScannedProduct(null);

    // Simulate camera decode delay
    setTimeout(async () => {
      try {
        const products = await productService.getProducts();
        const safe = Array.isArray(products) ? products : [];
        if (safe.length > 0) {
          // Pick a random product to simulate scan
          const randomItem = safe[Math.floor(Math.random() * safe.length)];
          setScannedProduct(randomItem);
          showSuccess(`Product scanned: ${randomItem.name} (${randomItem.sku})`);
        }
      } catch {
        showError('Scanning failed to read barcode.');
      } finally {
        setScanning(false);
      }
    }, 1200);
  };

  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!skuQuery.trim()) return;

    try {
      const products = await productService.getProducts();
      const safe = Array.isArray(products) ? products : [];
      const found = safe.find(
        (p) =>
          p.sku.toLowerCase() === skuQuery.trim().toLowerCase() ||
          p.name.toLowerCase().includes(skuQuery.trim().toLowerCase())
      );

      if (found) {
        setScannedProduct(found);
        showSuccess(`Product found: ${found.name}`);
      } else {
        showError(`No product matching "${skuQuery}" found in database.`);
      }
    } catch {
      showError('Search failed.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900">QR & Barcode Handheld Scanner</h2>
          <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">CAMERA SIMULATOR</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">Scan product barcodes or enter SKUs manually for fast warehouse actions</p>
      </div>

      {/* Camera Viewport Placeholder */}
      <div className="relative bg-slate-950 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[320px] text-white overflow-hidden shadow-xl border-4 border-slate-900">
        {/* Animated Scanner laser frame overlay */}
        <div className="absolute inset-8 border-2 border-blue-500/60 rounded-xl pointer-events-none flex flex-col justify-between">
          <div className="flex justify-between p-2">
            <div className="w-6 h-6 border-t-4 border-l-4 border-blue-500" />
            <div className="w-6 h-6 border-t-4 border-r-4 border-blue-500" />
          </div>

          {/* Red/Blue Laser Scan Line */}
          {scanning && (
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_#3b82f6] animate-scanner absolute left-0" />
          )}

          <div className="flex justify-between p-2">
            <div className="w-6 h-6 border-b-4 border-l-4 border-blue-500" />
            <div className="w-6 h-6 border-b-4 border-r-4 border-blue-500" />
          </div>
        </div>

        {/* Viewport Content */}
        <div className="relative z-10 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-blue-400 mx-auto backdrop-blur-xs">
            <ScanLine className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Camera Viewport Active</h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1">Align 1D Barcode or 2D QR code within frame</p>
          </div>

          <Button
            variant="primary"
            size="lg"
            icon={Camera}
            loading={scanning}
            onClick={handleSimulateScan}
            className="mt-2"
          >
            {scanning ? 'Scanning Barcode...' : 'Simulate Camera Scan'}
          </Button>
        </div>
      </div>

      {/* Manual Search Fallback */}
      <Card title="Manual SKU Search Fallback">
        <form onSubmit={handleManualSearch} className="flex gap-3">
          <div className="flex-1">
            <Input
              value={skuQuery}
              onChange={(e) => setSkuQuery(e.target.value)}
              placeholder="e.g. SKU-ELEC-1001 or scanner name..."
              icon={Search}
            />
          </div>
          <Button type="submit" variant="outline">
            Find SKU
          </Button>
        </form>
      </Card>

      {/* Scanned Result Card & Quick Actions */}
      {scannedProduct && (
        <Card
          title="Scanned Product Details"
          headerAction={<Badge status={scannedProduct.status} />}
          className="border-2 border-blue-500 animate-in fade-in duration-200"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-slate-900">{scannedProduct.name}</h4>
                <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-600 mt-1">
                  <span>SKU: {scannedProduct.sku}</span>
                  <span>Stock: <strong>{scannedProduct.currentStock} Units</strong></span>
                  <span>Location: {scannedProduct.storageLocation || 'Zone A'}</span>
                  <span>Price: {formatCurrency(scannedProduct.unitPrice)}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Quick Warehouse Actions:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={FileCheck}
                  onClick={() => navigate('/operations/receipts/create')}
                >
                  Receive Stock
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  icon={Truck}
                  onClick={() => navigate('/operations/deliveries/create')}
                >
                  Deliver Stock
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  icon={RefreshCw}
                  onClick={() => navigate('/operations/transfers/create')}
                >
                  Transfer Stock
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  icon={ListFilter}
                  onClick={() => navigate('/operations/adjustments/create')}
                >
                  Adjust Qty
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
