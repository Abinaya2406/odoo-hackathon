import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RiskBadge } from './RiskBadge';
import { PredictionChart } from './PredictionChart';
import { Button } from '../Button';
import {
  Calendar,
  Clock,
  TrendingDown,
  AlertTriangle,
  Info,
  Package,
  ShoppingCart,
  History,
  Building2,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const PredictionCard = React.memo(({ prediction, onClose }) => {
  const navigate = useNavigate();

  if (!prediction) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
        <Package className="w-10 h-10 mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-semibold">Select a product to view stockout prediction analysis</p>
        <p className="text-xs text-slate-400 mt-1">
          Click any row in the prediction table to inspect the depletion trajectory and risk factors.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 px-2 py-0.5 rounded-full text-blue-200">
              AI Forecast Model
            </span>
            <span className="text-xs text-slate-300 font-mono">ID: {prediction.sku}</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white">{prediction.productName}</h3>
          <p className="text-xs text-slate-300 mt-0.5">{prediction.warehouse} • {prediction.category}</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <RiskBadge risk={prediction.riskLevel} confidence={prediction.confidence} size="lg" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Core KPI metrics row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Current Stock
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              {prediction.currentStock} <span className="text-xs font-normal text-slate-500">{prediction.unit}</span>
            </span>
            <span className="text-[10px] text-slate-400">Safety: {prediction.safetyStock} {prediction.unit}</span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Avg Daily Usage
            </span>
            <span className="text-xl font-extrabold text-blue-600 mt-1 block">
              {prediction.avgDailyUsage} <span className="text-xs font-normal text-blue-400">{prediction.unit}/day</span>
            </span>
            <span className="text-[10px] text-slate-400">7-day rolling burn</span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Predicted Stockout
            </span>
            <span className="text-xl font-extrabold text-rose-600 mt-1 block">
              {prediction.predictedStockoutDays === 0 ? 'Stocked Out' : `${prediction.predictedStockoutDays} days`}
            </span>
            <span className="text-[10px] text-slate-400">Estimated remaining</span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Predicted Date
            </span>
            <span className="text-base font-bold text-slate-900 mt-1.5 block">
              {formatDate(prediction.predictedStockoutDate)}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">Confidence: {prediction.confidence}</span>
          </div>
        </div>

        {/* Visual Chart */}
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <PredictionChart
            data={prediction.historicalVsPredicted}
            unit={prediction.unit}
            safetyStock={prediction.safetyStock}
          />
        </div>

        {/* Explanation Section */}
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Why is this product at risk?</h4>
          </div>
          <ul className="space-y-1.5 pl-6 list-disc text-xs text-amber-950/80 leading-relaxed">
            {prediction.reasons.map((reason, idx) => (
              <li key={`reason-${idx}`}>{reason}</li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs text-amber-900">
            <span>
              <strong>AI Recommended Action:</strong> {prediction.recommendedAction}
            </span>
            {prediction.incomingShipment ? (
              <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-semibold">
                Incoming: {prediction.incomingShipment}
              </span>
            ) : (
              <span className="text-[11px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md font-semibold">
                No PO scheduled
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              icon={ShoppingCart}
              onClick={() => navigate(`/operations/receipts/create?product=${prediction.sku}`)}
            >
              Create Reorder
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={Package}
              onClick={() => navigate('/products')}
            >
              View Product
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={History}
              onClick={() => navigate('/operations/move-history')}
            >
              View Stock History
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={Building2}
              onClick={() => alert(`Primary Supplier: ${prediction.supplierName}\nContact: ${prediction.supplierContact}\nLead Time: ${prediction.leadTimeDays} days`)}
            >
              View Supplier
            </Button>
          </div>

          <span className="text-[11px] text-slate-400 italic">
            *Based on recent inventory patterns and lead times.
          </span>
        </div>
      </div>
    </div>
  );
});

PredictionCard.displayName = 'PredictionCard';
