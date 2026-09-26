import React from 'react';
import { Badge } from '../Badge';
import { Clock, QrCode, Barcode, Trash2, ArrowRight } from 'lucide-react';

export const RecentScans = React.memo(({
  scans = [],
  onSelectScan,
  onClearHistory
}) => {
  if (!scans || scans.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-400">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-60" />
        <p className="text-xs font-semibold">No recent scans recorded</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Scanned barcodes or QR codes will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Recent Scans History
          </h4>
        </div>

        {onClearHistory && (
          <button
            onClick={onClearHistory}
            className="text-[11px] font-medium text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      <div className="space-y-2">
        {scans.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectScan(item.sku || item.code)}
            className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors shrink-0">
                {item.type === 'QR Code' ? (
                  <QrCode className="w-4 h-4 text-slate-600 group-hover:text-blue-600" />
                ) : (
                  <Barcode className="w-4 h-4 text-slate-600 group-hover:text-blue-600" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{item.productName}</span>
                  <span className="text-[10px] font-mono text-slate-400">({item.sku})</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                  <span>Stock: {item.stock}</span>
                  <span>•</span>
                  <span>{item.warehouse}</span>
                  <span>•</span>
                  <span className="text-slate-400">{item.scannedAt}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Badge status={item.status} size="sm" />
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

RecentScans.displayName = 'RecentScans';
