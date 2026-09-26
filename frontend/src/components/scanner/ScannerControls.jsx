import React, { useState } from 'react';
import { Button } from '../Button';
import {
  Play,
  Square,
  QrCode,
  Barcode,
  Search,
  Sparkles,
  Zap,
  RotateCcw
} from 'lucide-react';

export const ScannerControls = React.memo(({
  isScanning,
  scanMode, // 'barcode' | 'qr'
  onStartScanner,
  onStopScanner,
  onSetScanMode,
  onManualSearch,
  onQuickSimulate
}) => {
  const [manualCode, setManualCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onManualSearch(manualCode.trim());
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Primary Action Buttons: Start, Stop & Mode Switchers */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {!isScanning ? (
            <Button
              variant="primary"
              size="md"
              icon={Play}
              onClick={onStartScanner}
              className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20"
            >
              Start Scanner
            </Button>
          ) : (
            <Button
              variant="danger"
              size="md"
              icon={Square}
              onClick={onStopScanner}
              className="shadow-md shadow-rose-500/20"
            >
              Stop Scanner
            </Button>
          )}

          <Button
            variant="outline"
            size="md"
            icon={Zap}
            onClick={() => onQuickSimulate()}
            disabled={!isScanning}
            title="Simulate successful barcode detection from camera stream"
          >
            Simulate Read
          </Button>
        </div>

        {/* Scan Mode Switchers */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => onSetScanMode('barcode')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              scanMode === 'barcode'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Barcode className="w-4 h-4" />
            <span>Scan Barcode</span>
          </button>
          <button
            type="button"
            onClick={() => onSetScanMode('qr')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              scanMode === 'qr'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR</span>
          </button>
        </div>
      </div>

      {/* Manual Input Form */}
      <form onSubmit={handleSubmit} className="pt-3 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-700 mb-1.5 block">
          Manual SKU / Barcode / QR Code Entry
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="e.g. SR-001, CW-002, 8901234567890, or QR-SR-001-MWH..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono"
            />
          </div>
          <Button type="submit" variant="primary" size="md">
            Search
          </Button>
        </div>
      </form>

      {/* Quick Test Presets for convenience */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-blue-500" />
          Test Barcode Presets:
        </span>
        {[
          { label: 'Steel Rod (SR-001)', code: 'SR-001' },
          { label: 'Copper Wire (CW-002)', code: 'CW-002' },
          { label: 'Ball Bearings (4105)', code: 'SKU-MECH-4105' },
          { label: 'Invalid Code Demo', code: 'INVALID-999' }
        ].map((preset) => (
          <button
            key={preset.code}
            type="button"
            onClick={() => {
              setManualCode(preset.code);
              onManualSearch(preset.code);
            }}
            className="text-[11px] font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200/80 transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
});

ScannerControls.displayName = 'ScannerControls';
