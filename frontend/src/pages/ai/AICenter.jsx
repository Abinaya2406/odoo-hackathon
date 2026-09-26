import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { predictionService } from '../../services/predictionService';
import { anomalyService } from '../../services/anomalyService';
import { aiService } from '../../services/aiService';
import { KPICard } from '../../components/KPICard';
import { LoadingState } from '../../components/LoadingState';
import {
  Brain,
  Sparkles,
  TrendingDown,
  ShieldAlert,
  MessageSquareCode,
  ScanLine,
  ArrowRight,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Package,
  Layers,
  Flame,
  ArrowUpRight
} from 'lucide-react';

export const AICenter = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [predictionKPIs, setPredictionKPIs] = useState({ productsAtRisk: 5, stockoutsPredicted: 4 });
  const [anomalyKPIs, setAnomalyKPIs] = useState({ totalAnomalies: 7, criticalAnomalies: 2 });
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [pMetrics, aMetrics, recos] = await Promise.all([
          predictionService.getPredictionKPIs(),
          anomalyService.getAnomalyKPIs(),
          aiService.getRecommendations()
        ]);
        if (mounted) {
          if (pMetrics) setPredictionKPIs(pMetrics);
          if (aMetrics) setAnomalyKPIs(aMetrics);
          if (Array.isArray(recos)) setRecommendations(recos);
        }
      } catch (err) {
        console.error('Error fetching AI Center data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <LoadingState message="Loading StockSense Intelligence Center..." />;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>AI & Machine Learning Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            StockSense Intelligence Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Unified control hub for intelligent inventory operations. Forecast stockouts, audit anomalies, converse in natural language, and scan warehouse codes with automated machine learning pipelines.
          </p>
        </div>
      </div>

      {/* AI Summary Cards (4 KPIs required) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Real-Time AI Intelligence Summary
          </h3>
          <span className="text-[11px] text-slate-400">Continuous telemetry across 3 facilities</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Products at Risk"
            value={predictionKPIs.productsAtRisk}
            change="5 SKUs flagged"
            changeType="decrease"
            icon={TrendingDown}
            color="yellow"
            subtext="Accelerated daily burn velocity"
          />
          <KPICard
            title="Active Anomalies"
            value={anomalyKPIs.totalAnomalies}
            change="2 critical"
            changeType="decrease"
            icon={ShieldAlert}
            color="red"
            subtext="Unusual quantity or timing shifts"
          />
          <KPICard
            title="Predicted Stockouts"
            value={predictionKPIs.stockoutsPredicted}
            change="Next 7 days"
            changeType="decrease"
            icon={Flame}
            color="purple"
            subtext="Products reaching zero stock"
          />
          <KPICard
            title="AI Recommendations"
            value={recommendations.length || 4}
            change="Actionable"
            changeType="increase"
            icon={Lightbulb}
            color="blue"
            subtext="Rebalance & restock advisories"
          />
        </div>
      </div>

      {/* Four Large Feature Cards (Required Section) */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Core Innovation Modules
          </h3>
          <span className="text-[11px] text-slate-400">Direct access to specialized intelligent suites</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Stockout Prediction */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-200 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Stockout Prediction
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Predict approximately when products may become critically low or reach zero stock using rolling burn rates and supplier lead-time buffers.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between font-medium">
                  <span>Forecast Accuracy:</span>
                  <span className="font-bold text-slate-900">91–96% confidence</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Urgent Risk:</span>
                  <span className="font-bold text-rose-600">Steel Rod, Copper Wire, Bearings</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">/ai/stockout-prediction</span>
              <Link
                to="/ai/stockout-prediction"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
              >
                <span>View Predictions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 2. Anomaly Detection */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-rose-200 transition-all duration-200 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                  AI Inventory Anomaly Detective
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Detect unusual inventory behaviour automatically. Identifies atypical bulk issues, unrecorded receipts, cycle-count oscillations, and out-of-hours movements.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between font-medium">
                  <span>Active Watchdog:</span>
                  <span className="font-bold text-emerald-600">Live 24/7 Monitoring</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Flagged Today:</span>
                  <span className="font-bold text-rose-600">150 kg Steel Rod Issue Spike</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">/ai/anomalies</span>
              <Link
                to="/ai/anomalies"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors shadow-sm shadow-rose-500/20"
              >
                <span>View Anomalies</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 3. AI Assistant */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-200 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <MessageSquareCode className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Natural-Language Assistant
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Ask questions about your inventory in plain language. Retrieve multi-format answers with product cards, hazard tables, comparison metrics, and direct links.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between font-medium">
                  <span>Supported Inquiries:</span>
                  <span className="font-bold text-slate-900">Stockouts, SKUs, Transfers, Burn</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Response Format:</span>
                  <span className="font-bold text-indigo-600">Interactive Cards & Graphs</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">/ai/assistant</span>
              <Link
                to="/ai/assistant"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/20"
              >
                <span>Ask StockSense AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 4. Smart Scanner */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-200 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <ScanLine className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Smart QR & Barcode Scanner
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Quickly identify products using QR/barcodes. Real-time optical camera viewfinder with laser sweep, status checking, and 1-click warehouse receipt/dispatch actions.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between font-medium">
                  <span>Symbologies:</span>
                  <span className="font-bold text-slate-900">QR, Code 128, EAN, UPC</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Quick Actions:</span>
                  <span className="font-bold text-emerald-600">Receive, Deliver, Transfer, Count</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">/scanner</span>
              <Link
                to="/scanner"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors shadow-sm shadow-slate-900/20"
              >
                <span>Open Scanner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations Stream */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Recommended Supervisory Actions</h4>
              <p className="text-xs text-slate-500">Autonomous suggestions derived from inventory ledger volatility</p>
            </div>
          </div>
          <Link to="/ai/recommendations" className="text-xs font-bold text-blue-600 hover:text-blue-800">
            View All ({recommendations.length}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendations.slice(0, 4).map((rec) => (
            <div
              key={rec.id}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-blue-50/30 transition-colors flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{rec.title}</span>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold text-slate-600">
                    {rec.type}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{rec.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
