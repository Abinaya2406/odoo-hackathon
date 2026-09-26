import React, { useState, useEffect } from 'react';
import { operationService } from '../../services/operationService';
import { Table } from '../../components/Table';
import { Badge } from '../../components/Badge';
import { LoadingState } from '../../components/LoadingState';
import { formatDateTime } from '../../utils/formatters';
import { ArrowRight, CheckCircle2, Truck, RefreshCw, ListFilter, FileCheck } from 'lucide-react';

export const StockLedgerPage = () => {
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    operationService.getMoveHistory().then((data) => {
      if (mounted) {
        setMoves(Array.isArray(data) ? data : []);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <LoadingState message="Building visual stock movement timeline..." />;

  const getActionIcon = (action) => {
    switch (action) {
      case 'Receipt':
        return <FileCheck className="w-4 h-4 text-emerald-600" />;
      case 'Delivery':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'Internal Transfer':
        return <RefreshCw className="w-4 h-4 text-indigo-600" />;
      case 'Stock Adjustment':
        return <ListFilter className="w-4 h-4 text-amber-600" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Stock Movement Visual Timeline</h2>
        <p className="text-xs text-slate-500 mt-0.5">Chronological flow diagram of all inventory transactions</p>
      </div>

      {/* Visual Timeline Stream */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 pb-2 border-b border-slate-100">
          Chronological Event Stream
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {moves.map((move, idx) => {
            const isPositive = move.quantity > 0;
            return (
              <div key={move.id || idx} className="relative flex items-start gap-4 group">
                {/* Node icon */}
                <div className="absolute -left-6 top-1 w-6 h-6 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center shrink-0 z-10 shadow-xs">
                  {getActionIcon(move.action)}
                </div>

                <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{move.productName}</span>
                      <span className="font-mono text-xs text-slate-400">({move.sku})</span>
                      <Badge status={move.status} size="sm" />
                    </div>
                    <span className="text-xs font-medium text-slate-500">{formatDateTime(move.date)}</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 text-xs pt-2 border-t border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">{move.action}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">{move.fromLocation}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-slate-800 font-medium">{move.toLocation}</span>
                    </div>

                    <span className={`font-extrabold font-mono text-sm ${isPositive ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {isPositive ? `+${move.quantity}` : move.quantity} Units
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
