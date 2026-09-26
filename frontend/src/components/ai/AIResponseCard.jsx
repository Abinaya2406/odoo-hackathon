import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Building2,
  Calendar,
  CheckCircle2,
  Flame,
  Info,
  Package,
  ShieldAlert,
  TrendingDown
} from 'lucide-react';
import { AIProductCard } from './AIProductCard';
import { Button } from '../Button';

export const AIResponseCard = React.memo(({ response }) => {
  if (!response) return null;

  const { type } = response;

  // 1. Multiple Product Cards (e.g. Products running out in 7 days)
  if (type === 'product_cards' && Array.isArray(response.products)) {
    return (
      <div className="space-y-3 mt-3">
        {response.products.map((prod, idx) => (
          <AIProductCard key={prod.id || `prod-${idx}`} product={prod} />
        ))}
        {response.recommendation && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>{response.recommendation}</span>
          </div>
        )}
      </div>
    );
  }

  // 2. Warning Card (e.g. Critical stock / threshold breaches)
  if (type === 'warning_card') {
    return (
      <div className="mt-3 p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 text-rose-900">
          <Flame className="w-5 h-5 text-rose-600" />
          <h4 className="text-sm font-bold">{response.title || 'Critical Stock Warning'}</h4>
        </div>

        {Array.isArray(response.items) && (
          <div className="space-y-2">
            {response.items.map((item, idx) => (
              <div
                key={`warn-item-${idx}`}
                className="bg-white p-2.5 rounded-lg border border-rose-100 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800">{item.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono ml-1.5">({item.sku})</span>
                  <p className="text-[11px] text-slate-600">{item.stock}</p>
                </div>
                <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {Array.isArray(response.actions) && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-rose-200/60">
            {response.actions.map((act, idx) => (
              <Link
                key={`act-${idx}`}
                to={act.url}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-white px-3 py-1.5 rounded-lg border border-rose-200 shadow-2xs"
              >
                <span>{act.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 3. Anomaly List
  if (type === 'anomaly_list' && Array.isArray(response.anomalies)) {
    return (
      <div className="mt-3 space-y-2.5">
        {response.anomalies.map((anom, idx) => (
          <div
            key={`anom-${idx}`}
            className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{anom.product}</span>
                <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded">
                  {anom.severity}
                </span>
              </div>
              <p className="text-slate-600 mt-0.5">
                {anom.eventType}: Expected <strong>{anom.expected}</strong> → Recorded <strong className="text-rose-600">{anom.actual}</strong>
              </p>
              <span className="text-[10px] text-slate-400">{anom.warehouse} • {anom.time}</span>
            </div>
          </div>
        ))}

        {response.action && (
          <Link
            to={response.action.url}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 mt-2"
          >
            <span>{response.action.label}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    );
  }

  // 4. Warehouse Comparison Table
  if (type === 'warehouse_table' && Array.isArray(response.warehouses)) {
    return (
      <div className="mt-3 space-y-3">
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Facility</th>
                <th className="p-3">Stored Units</th>
                <th className="p-3">Capacity</th>
                <th className="p-3">Utilization</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {response.warehouses.map((wh, idx) => (
                <tr key={`wh-${idx}`} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-900">{wh.name}</td>
                  <td className="p-3 font-mono">{wh.units}</td>
                  <td className="p-3 font-mono text-slate-400">{wh.capacity}</td>
                  <td className="p-3 font-bold text-blue-600">{wh.utilization}</td>
                  <td className="p-3">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {wh.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {response.recommendation && (
          <p className="text-xs text-slate-500 italic">{response.recommendation}</p>
        )}
      </div>
    );
  }

  // 5. Product Detail Card (e.g. Steel Rod status query)
  if (type === 'product_detail' && response.product) {
    const p = response.product;
    return (
      <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
            <span className="text-[11px] text-slate-500 font-mono">SKU: {p.sku}</span>
          </div>
          <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md text-[11px]">
            {p.status}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div className="bg-white p-2.5 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Stock</span>
            <span className="font-black text-slate-900 text-sm">{p.totalStock}</span>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Daily Consumption</span>
            <span className="font-bold text-blue-600 text-xs">{p.burnRate}</span>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-100 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Predicted Stockout</span>
            <span className="font-bold text-rose-600 text-xs">{p.predictedStockout}</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-600">
          <strong>Storage:</strong> {p.warehouse}
        </p>

        {Array.isArray(response.actions) && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
            {response.actions.map((act, idx) => (
              <Link
                key={`act-${idx}`}
                to={act.url}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white border border-slate-200 text-blue-600 hover:text-blue-800 font-semibold text-xs shadow-2xs"
              >
                <span>{act.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 6. Priority Summary / Immediate Attention
  if (type === 'priority_summary' && Array.isArray(response.items)) {
    return (
      <div className="mt-3 space-y-2.5">
        {response.items.map((item, idx) => (
          <div
            key={`pri-${idx}`}
            className="p-3 rounded-xl border border-slate-200 bg-white flex items-start gap-3 text-xs shadow-2xs"
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${
              item.badgeColor === 'rose' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{item.title}</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.2 rounded">
                  {item.priority}
                </span>
              </div>
              <p className="text-slate-600 mt-0.5 leading-relaxed">{item.detail}</p>
            </div>
          </div>
        ))}

        {Array.isArray(response.quickLinks) && (
          <div className="flex flex-wrap gap-2 pt-2">
            {response.quickLinks.map((lk, idx) => (
              <Link
                key={`lk-${idx}`}
                to={lk.url}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100"
              >
                {lk.label} →
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 7. Declining Demand Items
  if (type === 'declining_demand' && Array.isArray(response.items)) {
    return (
      <div className="mt-3 space-y-2.5">
        {response.items.map((item, idx) => (
          <div key={`dec-${idx}`} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">{item.name}</span>
              <span className="text-rose-600 font-semibold">{item.trend}</span>
            </div>
            <p className="text-slate-500 font-mono text-[11px]">Stock: {item.currentStock}</p>
            <p className="text-slate-600"><strong>Recommendation:</strong> {item.recommendedAction}</p>
          </div>
        ))}
      </div>
    );
  }

  return null;
});

AIResponseCard.displayName = 'AIResponseCard';
