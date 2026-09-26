import React, { useState } from 'react';
import {
  ScanLine,
  Camera,
  Flashlight,
  SwitchCamera,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap
} from 'lucide-react';

export const ScannerView = React.memo(({
  scannerState = 'ready', // 'ready' | 'permission' | 'scanning' | 'detected' | 'invalid' | 'not_found' | 'error'
  scanMode = 'barcode', // 'barcode' | 'qr'
  onSimulateCapture,
  onResetState,
  lastScannedCode
}) => {
  const [torchOn, setTorchOn] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // environment | user

  const toggleTorch = () => setTorchOn((prev) => !prev);
  const toggleFacing = () => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));

  return (
    <div className="relative w-full rounded-3xl bg-slate-950 overflow-hidden shadow-2xl border-4 border-slate-900 flex flex-col justify-between min-h-[380px] sm:min-h-[440px] text-white">
      {/* Top HUD Controls overlay */}
      <div className="relative z-20 flex items-center justify-between p-4 sm:p-5 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            {scanMode === 'qr' ? '2D Matrix QR Scanner' : '1D / 2D Barcode Engine'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTorch}
            className={`p-2 rounded-xl border backdrop-blur-md transition-all ${
              torchOn
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                : 'bg-white/10 text-white border-white/15 hover:bg-white/20'
            }`}
            title="Toggle Flash / Torch"
          >
            <Flashlight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={toggleFacing}
            className="p-2 rounded-xl bg-white/10 text-white border border-white/15 hover:bg-white/20 backdrop-blur-md transition-all"
            title="Switch Camera Sensor"
          >
            <SwitchCamera className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Viewport Frame & Reticle */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        {/* Reticle Target Area */}
        <div
          className={`relative ${
            scanMode === 'qr' ? 'w-56 h-56 sm:w-64 sm:h-64' : 'w-72 h-44 sm:w-80 sm:h-52'
          } rounded-2xl border-2 transition-all duration-300 flex items-center justify-center ${
            scannerState === 'detected'
              ? 'border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.4)]'
              : scannerState === 'invalid' || scannerState === 'not_found' || scannerState === 'error'
              ? 'border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.4)]'
              : scannerState === 'scanning'
              ? 'border-blue-400/80 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
              : 'border-white/30'
          }`}
        >
          {/* 4 Corner Bracket Accents */}
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />

          {/* Animated Laser Scan Line */}
          {scannerState === 'scanning' && (
            <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_16px_#60a5fa] animate-scanner" />
          )}

          {/* Torch Light Aura Overlay */}
          {torchOn && (
            <div className="absolute inset-0 bg-amber-300/10 pointer-events-none rounded-2xl blur-md" />
          )}

          {/* Center Target Indicator or State Graphics */}
          {scannerState === 'ready' && (
            <div className="text-center p-4">
              <ScanLine className="w-10 h-10 text-blue-400/80 mx-auto animate-pulse mb-2" />
              <p className="text-xs font-semibold text-slate-300">Align code inside viewfinder</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Supports Code 128, EAN, UPC & QR Codes</p>
            </div>
          )}

          {scannerState === 'scanning' && (
            <div className="text-center">
              <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs font-bold text-blue-300 uppercase tracking-widest">Decoding...</p>
            </div>
          )}

          {scannerState === 'detected' && (
            <div className="text-center p-3 animate-in zoom-in duration-150">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider">Code Detected!</p>
              <p className="text-xs font-mono text-white mt-1 font-bold bg-slate-900/80 px-2 py-0.5 rounded border border-emerald-500/40">
                {lastScannedCode || 'Verified'}
              </p>
            </div>
          )}

          {scannerState === 'not_found' && (
            <div className="text-center p-3 animate-in zoom-in duration-150">
              <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-rose-300">Product Not Found</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[180px]">
                The scanned code does not match any product in inventory.
              </p>
              <button
                onClick={onResetState}
                className="mt-2 text-[11px] font-semibold text-white bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg"
              >
                Scan Again
              </button>
            </div>
          )}

          {scannerState === 'invalid' && (
            <div className="text-center p-3 animate-in zoom-in duration-150">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-amber-300">Invalid Code Format</p>
              <p className="text-[10px] text-slate-400 mt-1">Please ensure code is clear and not smudged.</p>
              <button
                onClick={onResetState}
                className="mt-2 text-[11px] font-semibold text-white bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg"
              >
                Retry
              </button>
            </div>
          )}

          {scannerState === 'permission' && (
            <div className="text-center p-3">
              <Camera className="w-10 h-10 text-amber-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-amber-300">Camera Access Prompt</p>
              <p className="text-[10px] text-slate-400 mt-1">Allow browser camera permissions to begin.</p>
            </div>
          )}

          {scannerState === 'error' && (
            <div className="text-center p-3">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-rose-300">Scanner Sensor Error</p>
              <button
                onClick={onResetState}
                className="mt-2 text-[11px] font-semibold text-white bg-rose-600 px-3 py-1 rounded-lg"
              >
                Restart Scanner
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Status & Guidelines Bar */}
      <div className="relative z-20 p-4 sm:p-5 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-blue-400" />
          <span>Real-time optical symbology decoder</span>
        </span>
        <span className="font-mono text-[10px] text-slate-500 uppercase">
          Camera: {facingMode === 'environment' ? 'Rear (High-Res)' : 'Front'}
        </span>
      </div>
    </div>
  );
});

ScannerView.displayName = 'ScannerView';
