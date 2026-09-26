import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { predictionService } from '../../services/predictionService';
import { KPICard } from '../../components/KPICard';
import { RiskBadge } from '../../components/ai/RiskBadge';
import { PredictionCard } from '../../components/ai/PredictionCard';
import { LoadingState } from '../../components/LoadingState';
import { Table } from '../../components/Table';
import { Button } from '../../components/Button';
import {
  Calendar,
  AlertTriangle,
  Flame,
  Clock,
  Sparkles,
  TrendingDown,
  Search,
  ShoppingCart,
  Filter,
  CheckCircle2,
  Package
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const StockoutPrediction = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState([]);
  const [kpis, setKpis] = useState({
    productsAtRisk: 0,
    stockoutsPredicted: 0,
    criticalProducts: 0,
    avgDaysToStockout: 0
  });

  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('product') || '');
  const [riskFilter, setRiskFilter] = useState('All');

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [preds, metrics] = await Promise.all([
          predictionService.getStockoutPredictions(),
          predictionService.getPredictionKPIs()
        ]);

        if (mounted) {
          const safePreds = Array.isArray(preds) ? preds : [];
          setPredictions(safePreds);
          if (metrics) setKpis(metrics);

          // Check if product query param matches
          const targetCode = searchParams.get('product');
          if (targetCode && safePreds.length > 0) {
            const found = safePreds.find(
              (p) =>
                p.sku.toLowerCase() === targetCode.toLowerCase() ||
                p.productName.toLowerCase().includes(targetCode.toLowerCase())
            );
            if (found) setSelectedPrediction(found);
            else setSelectedPrediction(safePreds[0]);
          } else if (safePreds.length > 0) {
            setSelectedPrediction(safePreds[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching stockout predictions:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, [searchParams]);

  // Filter predictions
  const filteredPredictions = predictions.filter((p) => {
    if (riskFilter !== 'All' && p.riskLevel.toLowerCase() !== riskFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        p.productName.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.warehouse.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Table columns definition
  const columns = [
    {
      key: 'productName',
      label: 'Product',
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            {val}
          </span>
          <span className="text-[11px] text-slate-400">{row.warehouse}</span>
        </div>
      )
    },
    {
      key: 'sku',
      label: 'SKU',
      render: (val) => <span className="font-mono text-xs text-slate-600 font-semibold">{val}</span>
    },
    {
      key: 'currentStock',
      label: 'Current Stock',
      render: (val, row) => (
        <span className="font-bold text-slate-800">
          {val} <span className="text-xs font-normal text-slate-500">{row.unit}</span>
        </span>
      )
    },
    {
      key: 'avgDailyUsage',
      label: 'Avg Daily Usage',
      render: (val, row) => (
        <span className="text-blue-600 font-semibold text-xs">
          {val} {row.unit}/day
        </span>
      )
    },
    {
      key: 'predictedStockoutDate',
      label: 'Predicted Stockout',
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800 text-xs">
            {formatDate(val)}
          </span>
          <span className="text-[10px] text-slate-400">
            {row.predictedStockoutDays === 0 ? 'Depleted' : `in ${row.predictedStockoutDays} days`}
          </span>
        </div>
      )
    },
    {
      key: 'predictedStockoutDays',
      label: 'Days Remaining',
      render: (val) => (
        <span
          className={`font-mono font-extrabold text-xs px-2.5 py-1 rounded-md ${
            val <= 3
              ? 'bg-rose-100 text-rose-800'
              : val <= 7
              ? 'bg-amber-100 text-amber-800'
              : 'bg-emerald-100 text-emerald-800'
          }`}
        >
          {val === 0 ? '0 (Out)' : `${val} d`}
        </span>
      )
    },
    {
      key: 'riskLevel',
      label: 'Risk Level',
      render: (val, row) => <RiskBadge risk={val} confidence={row.confidence} size="sm" />
    },
    {
      key: 'confidence',
      label: 'Confidence',
      render: (val) => <span className="text-xs font-mono font-bold text-slate-600">{val}</span>
    },
    {
      key: 'recommendedAction',
      label: 'Recommended Action',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-700 truncate max-w-[180px]" title={val}>
            {val}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/operations/receipts/create?product=${row.sku}`);
            }}
            title="Create Reorder PO"
          >
            Reorder
          </Button>
        </div>
      )
    }
  ];

  if (loading) return <LoadingState message="Calculating Stockout Depletion Predictions..." />;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Stockout Prediction</h2>
            <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Machine Learning Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Forecast estimated stockout dates using rolling daily consumption, supplier lead times, and volatility metrics
          </p>
        </div>
      </div>

      {/* KPI Cards (4 metrics required) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Products at Risk"
          value={kpis.productsAtRisk}
          change="Requires oversight"
          changeType="decrease"
          icon={AlertTriangle}
          color="yellow"
          subtext="Items with high burn velocity"
        />
        <KPICard
          title="Stockouts Predicted"
          value={kpis.stockoutsPredicted}
          change="Within next 7 days"
          changeType="decrease"
          icon={Flame}
          color="red"
          subtext="Predicted zero-stock events"
        />
        <KPICard
          title="Critical Products"
          value={kpis.criticalProducts}
          change="Zero or sub-safety"
          changeType="decrease"
          icon={TrendingDown}
          color="purple"
          subtext="Immediate restock needed"
        />
        <KPICard
          title="Avg Days to Stockout"
          value={`${kpis.avgDaysToStockout} days`}
          change="Lead-time buffer"
          changeType="neutral"
          icon={Clock}
          color="blue"
          subtext="Across high-risk inventory"
        />
      </div>

      {/* Selected Prediction Detailed Card & Chart */}
      <PredictionCard
        prediction={selectedPrediction}
        onClose={() => setSelectedPrediction(null)}
      />

      {/* Filters & Product Prediction Table */}
      <div className="space-y-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by product name, SKU, or warehouse facility..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Risk Level Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-400 mr-2 shrink-0">Risk Level:</span>
            {['All', 'Critical', 'High', 'Medium', 'Low'].map((r) => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 ${
                  riskFilter === r
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Prediction Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Product Prediction Catalog ({filteredPredictions.length})
            </h3>
            <span className="text-[11px] text-slate-400">Click any row to inspect trajectory details above</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  {columns.map((c) => (
                    <th key={c.key} className="py-3 px-4">{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPredictions.map((row) => {
                  const isSelected = selectedPrediction?.id === row.id;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedPrediction(row)}
                      className={`cursor-pointer transition-colors duration-150 ${
                        isSelected
                          ? 'bg-blue-50/80 font-medium'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {columns.map((col) => (
                        <td key={`cell-${row.id}-${col.key}`} className="py-3 px-4">
                          {col.render ? col.render(row[col.key], row) : row[col.key]}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
