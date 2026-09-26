import React, { useState, useEffect } from 'react';
import { aiService } from '../../services/aiService';
import { Card } from '../../components/Card';
import { Select } from '../../components/Select';
import { LoadingState } from '../../components/LoadingState';
import { Brain, Sparkles, TrendingUp, ShieldCheck, Info } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const DemandForecastPage = () => {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState('');

  useEffect(() => {
    let mounted = true;
    aiService.getDemandForecasts().then((data) => {
      if (mounted) {
        const safe = Array.isArray(data) ? data : [];
        setForecasts(safe);
        if (safe.length > 0) setSelectedProductId(safe[0].productId);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <LoadingState message="Running ML demand prediction algorithms..." />;

  const safeForecasts = Array.isArray(forecasts) ? forecasts : [];
  const currentForecast = safeForecasts.find((f) => f.productId === selectedProductId) || safeForecasts[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">AI Predictive Demand Forecast</h2>
            <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-600" /> ML v4.2 Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Forecast product consumption trends and prevent future stockouts</p>
        </div>

        {/* Product selector */}
        <div className="w-full sm:w-72">
          <Select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            options={safeForecasts.map((f) => ({ label: f.productName, value: f.productId }))}
          />
        </div>
      </div>

      {currentForecast && (
        <>
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Current Stock</span>
              <span className="text-2xl font-bold text-slate-900">{currentForecast.currentStock} Units</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">7-Day Demand</span>
              <span className="text-2xl font-bold text-blue-600">{currentForecast.forecast7D} Units</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">30-Day Demand</span>
              <span className="text-2xl font-bold text-blue-700">{currentForecast.forecast30D} Units</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">3-Month Demand</span>
              <span className="text-2xl font-bold text-indigo-700">{currentForecast.forecast3M} Units</span>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Model Confidence</span>
                <span className="text-2xl font-extrabold text-emerald-700">{currentForecast.confidence}</span>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
            </div>
          </div>

          {/* Historical vs Predicted Line Chart */}
          <Card
            title={`Demand Curve: Historical vs AI Predicted (${currentForecast.productName})`}
            subtitle="Comparing past consumption data against machine learning prediction curve"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={currentForecast.historicalVsPredicted} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#FFF', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="historical" name="Actual Past Sales / Moves" stroke="#94A3B8" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="predicted" name="AI Projected Demand Curve" stroke="#2563EB" strokeWidth={3} dot={{ r: 5, fill: '#2563EB' }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Insights Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-blue-900">AI Model Forecast Rationale</h4>
              <p className="text-xs text-blue-800 mt-0.5 leading-relaxed">{currentForecast.insights}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
