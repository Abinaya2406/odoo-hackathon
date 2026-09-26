import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { scannerService } from '../../services/scannerService';
import { useToast } from '../../context/ToastContext';
import { ScannerView } from '../../components/scanner/ScannerView';
import { ScannerControls } from '../../components/scanner/ScannerControls';
import { ScanResultCard } from '../../components/scanner/ScanResultCard';
import { RecentScans } from '../../components/scanner/RecentScans';
import { ScanLine, ShieldCheck, Zap } from 'lucide-react';

export const ProductScanner = () => {
  const [searchParams] = useSearchParams();
  const { showSuccess, showError, showWarning } = useToast();

  const [isScanning, setIsScanning] = useState(true);
  const [scanMode, setScanMode] = useState('barcode'); // 'barcode' | 'qr'
  const [scannerState, setScannerState] = useState('ready'); // 'ready' | 'permission' | 'scanning' | 'detected' | 'invalid' | 'not_found' | 'error'
  const [lastScannedCode, setLastScannedCode] = useState('');
  const [scannedProduct, setScannedProduct] = useState(null);
  const [recentScans, setRecentScans] = useState([]);

  // Load recent scans on mount
  useEffect(() => {
    let mounted = true;
    scannerService.getRecentScans().then((scans) => {
      if (mounted) setRecentScans(Array.isArray(scans) ? scans : []);
    });

    // Check if URL contains ?code=...
    const initialCode = searchParams.get('code');
    if (initialCode) {
      handlePerformScan(initialCode);
    }

    return () => {
      mounted = false;
    };
  }, []);

  const handleStartScanner = () => {
    setIsScanning(true);
    setScannerState('ready');
  };

  const handleStopScanner = () => {
    setIsScanning(false);
    setScannerState('ready');
  };

  const handlePerformScan = async (rawCode) => {
    if (!rawCode || !rawCode.trim()) return;

    setScannerState('scanning');
    setLastScannedCode(rawCode);

    // Simulate sensor decode time
    setTimeout(async () => {
      try {
        const product = await scannerService.scanCode(rawCode);
        setScannedProduct(product);
        setScannerState('detected');
        showSuccess(`Code identified: ${product.name} (${product.sku})`);

        // Refresh recent scans list
        const updatedScans = await scannerService.getRecentScans();
        setRecentScans(updatedScans);
      } catch (err) {
        if (err.code === 'PRODUCT_NOT_FOUND') {
          setScannerState('not_found');
          showError(`Product code "${rawCode}" was not found in inventory.`);
        } else {
          setScannerState('invalid');
          showWarning('Unable to decode barcode pattern. Please realign scanner.');
        }
      }
    }, 850);
  };

  const handleQuickSimulate = async () => {
    setScannerState('scanning');
    setTimeout(async () => {
      try {
        const product = await scannerService.simulateCameraScan();
        setScannedProduct(product);
        setLastScannedCode(scanMode === 'qr' ? product.qrCode : product.barcode);
        setScannerState('detected');
        showSuccess(`Captured from optical sensor: ${product.name}`);

        const updatedScans = await scannerService.getRecentScans();
        setRecentScans(updatedScans);
      } catch (err) {
        setScannerState('error');
        showError('Optical sensor error during decode.');
      }
    }, 700);
  };

  const handleClearRecentScans = async () => {
    await scannerService.clearRecentScans();
    setRecentScans([]);
    showSuccess('Recent scan history cleared.');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Scan Product</h2>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              Real-Time Handheld Interface
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Warehouse optical barcode and 2D QR decoder with instant product lookups and ledger workflows
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Scanner Engine Online</span>
        </div>
      </div>

      {/* Main Grid: Left Scanner Viewport + Controls; Right Scanned Details & Recent History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Camera Viewport & Controls */}
        <div className="lg:col-span-7 space-y-4">
          <ScannerView
            scannerState={scannerState}
            scanMode={scanMode}
            lastScannedCode={lastScannedCode}
            onResetState={() => setScannerState('ready')}
          />

          <ScannerControls
            isScanning={isScanning}
            scanMode={scanMode}
            onStartScanner={handleStartScanner}
            onStopScanner={handleStopScanner}
            onSetScanMode={(mode) => {
              setScanMode(mode);
              setScannerState('ready');
            }}
            onManualSearch={handlePerformScan}
            onQuickSimulate={handleQuickSimulate}
          />
        </div>

        {/* Right Column (5 cols): Result Card & Recent Scans */}
        <div className="lg:col-span-5 space-y-6">
          {scannedProduct ? (
            <ScanResultCard
              product={scannedProduct}
              onDismiss={() => {
                setScannedProduct(null);
                setScannerState('ready');
              }}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400">
              <ScanLine className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <h4 className="text-sm font-bold text-slate-700">Awaiting Product Scan</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Align an item code inside the camera viewfinder, enter an SKU manually, or click a test preset below the controls.
              </p>
            </div>
          )}

          {/* Recent Scans Component */}
          <RecentScans
            scans={recentScans}
            onSelectScan={handlePerformScan}
            onClearHistory={handleClearRecentScans}
          />
        </div>
      </div>
    </div>
  );
};
