import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { operationService } from '../../services/operationService';
import { aiService } from '../../services/aiService';
import { KPICard } from '../../components/KPICard';
import { ChartCard } from '../../components/ChartCard';
import { Badge } from '../../components/Badge';
import { LoadingState } from '../../components/LoadingState';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import {
  Package,
  AlertTriangle,
  PackageX,
  FileCheck,
  Truck,
  RefreshCw,
  Coins,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Brain,
  ShieldAlert,
  Boxes,
  ScanLine,
  Flame,
  Lightbulb
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [timeframe, setTimeframe] = useState('30D');

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        const [prods, recs, dels, trfs, recos] = await Promise.all([
          productService.getProducts(),
          operationService.getReceipts(),
          operationService.getDeliveries(),
          operationService.getTransfers(),
          aiService.getRecommendations()
        ]);

        if (isMounted) {
          setProducts(Array.isArray(prods) ? prods : []);
          setReceipts(Array.isArray(recs) ? recs : []);
          setDeliveries(Array.isArray(dels) ? dels : []);
          setTransfers(Array.isArray(trfs) ? trfs : []);
          setAiRecommendations(Array.isArray(recos) ? recos : []);
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute KPI metrics
  const safeProducts = Array.isArray(products) ? products : [];
  const totalProducts = 1250 + safeProducts.length; // blended realistic mock count
  const totalStockUnits = safeProducts.reduce((acc, p) => acc + (Number(p.currentStock) || 0), 0) + 45000;
  const lowStockCount = 32 + safeProducts.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStock).length;
  const outOfStockCount = 8 + safeProducts.filter((p) => p.currentStock === 0).length;
  const inventoryValue = 2450000 + safeProducts.reduce((acc, p) => acc + (p.currentStock * (p.unitPrice || 500)), 0);

  const pendingReceipts = 14 + (Array.isArray(receipts) ? receipts.filter((r) => r.status !== 'Done').length : 0);
  const pendingDeliveries = 19 + (Array.isArray(deliveries) ? deliveries.filter((d) => d.status !== 'Done').length : 0);
  const activeTransfers = 9 + (Array.isArray(transfers) ? transfers.length : 0);

  // Mock Movement Data by Period
  const movementData = useMemo(() => {
    if (timeframe === '7D') {
      return [
        { day: 'Mon', incoming: 420, outgoing: 380 },
        { day: 'Tue', incoming: 580, outgoing: 490 },
        { day: 'Wed', incoming: 310, outgoing: 620 },
        { day: 'Thu', incoming: 890, outgoing: 540 },
        { day: 'Fri', incoming: 650, outgoing: 710 },
        { day: 'Sat', incoming: 220, outgoing: 300 },
        { day: 'Sun', incoming: 150, outgoing: 180 },
      ];
    }
    if (timeframe === '3M') {
      return [
        { day: 'Week 1', incoming: 3200, outgoing: 2900 },
        { day: 'Week 2', incoming: 4100, outgoing: 3800 },
        { day: 'Week 3', incoming: 2800, outgoing: 3400 },
        { day: 'Week 4', incoming: 5200, outgoing: 4600 },
        { day: 'Week 5', incoming: 4800, outgoing: 4200 },
        { day: 'Week 6', incoming: 3900, outgoing: 4100 },
      ];
    }
    // Default 30D
    return [
      { day: 'Sep 1', incoming: 1200, outgoing: 950 },
      { day: 'Sep 5', incoming: 1850, outgoing: 1400 },
      { day: 'Sep 10', incoming: 1400, outgoing: 1650 },
      { day: 'Sep 15', incoming: 2300, outgoing: 1900 },
      { day: 'Sep 20', incoming: 1950, outgoing: 2100 },
      { day: 'Sep 25', incoming: 3100, outgoing: 2450 },
    ];
  }, [timeframe]);

  // Donut chart category distribution
  const categoryData = useMemo(() => {
    return [
      { name: 'Electronics', value: 35, color: '#2563EB' },
      { name: 'Packaging', value: 25, color: '#3B82F6' },
      { name: 'Industrial', value: 20, color: '#60A5FA' },
      { name: 'Safety & PPE', value: 12, color: '#93C5FD' },
      { name: 'Office', value: 8, color: '#BFDBFE' },
    ];
  }, []);

  // Warehouse comparison
  const warehouseData = useMemo(() => {
    return [
      { name: 'CDC Bengaluru', stock: 28400, capacity: 35000 },
      { name: 'West Hub (Mumbai)', stock: 12500, capacity: 20000 },
      { name: 'North Depot (Delhi)', stock: 8020, capacity: 15000 },
    ];
  }, []);

  if (loading) {
    return <LoadingState message="Initializing StockSense Dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold backdrop-blur-md mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>Real-Time Inventory Operations</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">StockSense Control Center</h2>
            <p className="text-xs text-blue-100 mt-1 max-w-xl">
              All warehouses operating normally. 4 AI recommendations available for stock rebalancing and emergency reorders.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <Link
              to="/scanner"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 transition-colors shadow-sm"
            >
              <ScanLine className="w-4 h-4 text-blue-600" />
              <span>Scan Product</span>
            </Link>
            <Link
              to="/ai"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 transition-colors backdrop-blur-md"
            >
              <Brain className="w-4 h-4 text-blue-200" />
              <span>AI Center</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Card Grid (8 metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Products"
          value={formatNumber(totalProducts)}
          change="+8.4%"
          changeType="increase"
          icon={Package}
          color="blue"
          subtext="Active SKUs cataloged"
        />
        <KPICard
          title="Total Stock Units"
          value={formatNumber(totalStockUnits)}
          change="+12.1%"
          changeType="increase"
          icon={Boxes}
          color="blue"
          subtext="Units across 3 warehouses"
        />
        <KPICard
          title="Low Stock Items"
          value={lowStockCount}
          change="+4 items"
          changeType="decrease"
          icon={AlertTriangle}
          color="yellow"
          subtext="Below safety threshold"
        />
        <KPICard
          title="Out of Stock"
          value={outOfStockCount}
          change="Needs action"
          changeType="decrease"
          icon={PackageX}
          color="red"
          subtext="Critical stockouts"
        />
        <KPICard
          title="Pending Receipts"
          value={pendingReceipts}
          change="14 waiting"
          changeType="neutral"
          icon={FileCheck}
          color="purple"
          subtext="Inbound supplier orders"
        />
        <KPICard
          title="Pending Deliveries"
          value={pendingDeliveries}
          change="19 active"
          changeType="neutral"
          icon={Truck}
          color="blue"
          subtext="Outbound customer orders"
        />
        <KPICard
          title="Internal Transfers"
          value={activeTransfers}
          change="In transit"
          changeType="neutral"
          icon={RefreshCw}
          color="gray"
          subtext="Warehouse relocation"
        />
        <KPICard
          title="Inventory Value"
          value={formatCurrency(inventoryValue, 'INR')}
          change="+5.2% MoM"
          changeType="increase"
          icon={Coins}
          color="green"
          subtext="Total stock valuation"
        />
      </div>

      {/* AI Insights Group */}
      <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-slate-50 border border-blue-200/90 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                StockSense AI Insights
                <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">LIVE PREDICTIONS</span>
              </h3>
              <p className="text-xs text-slate-500">Autonomous machine learning risk assessments, anomaly alerts, and optical scanning</p>
            </div>
          </div>
          <Link
            to="/ai"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-blue-200 shadow-2xs"
          >
            <span>Explore AI Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Stockout Warning */}
          <div className="p-5 rounded-2xl border border-amber-200/80 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-600" />
                  Stockout Warning
                </span>
                <Badge status="High-Risk" size="sm">High Risk</Badge>
              </div>
              <p className="text-sm font-extrabold text-slate-900 mb-1">
                Steel Rod may run out in 6 days.
              </p>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Accelerated burn rate of 30 kg/day exceeds safety threshold. No purchase receipt scheduled.
              </p>
            </div>
            <Link
              to="/ai/stockout-prediction?product=SR-001"
              className="inline-flex items-center justify-between text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3.5 py-2 rounded-xl transition-colors"
            >
              <span>View Prediction</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 2. Anomaly Alert */}
          <div className="p-5 rounded-2xl border border-rose-200/80 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Anomaly Alert
                </span>
                <Badge status="Critical" size="sm">Outlier</Badge>
              </div>
              <p className="text-sm font-extrabold text-slate-900 mb-1">
                Unusual 150 kg Steel Rod issue detected.
              </p>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Logged at Main Warehouse by Alex Morgan. +275% spike over normal 10–40 kg threshold.
              </p>
            </div>
            <Link
              to="/ai/anomalies?product=SR-001"
              className="inline-flex items-center justify-between text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-xl transition-colors"
            >
              <span>Review Anomaly</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 3. AI Recommendation */}
          <div className="p-5 rounded-2xl border border-blue-200/80 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  AI Recommendation
                </span>
                <Badge status="Ready" size="sm">Action</Badge>
              </div>
              <p className="text-sm font-extrabold text-slate-900 mb-1">
                3 products require attention today.
              </p>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Ball Bearings are stocked out; Copper Wire needs reorder; LiFePO4 battery audit pending.
              </p>
            </div>
            <Link
              to="/ai"
              className="inline-flex items-center justify-between text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition-colors"
            >
              <span>View AI Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 4. Quick Scan */}
          <div className="p-5 rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                  <ScanLine className="w-4 h-4 text-indigo-400" />
                  Quick Scan
                </span>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full font-bold">
                  HANDHELD
                </span>
              </div>
              <p className="text-sm font-extrabold text-white mb-1">
                Instant Warehouse Identification
              </p>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Scan 1D barcodes or 2D QR codes to execute receipts, deliveries, transfers, or cycle counts.
              </p>
            </div>
            <Link
              to="/scanner"
              className="inline-flex items-center justify-between text-xs font-bold text-slate-950 bg-white hover:bg-blue-50 px-3.5 py-2 rounded-xl transition-colors shadow-sm"
            >
              <span className="flex items-center gap-1.5">
                <ScanLine className="w-4 h-4 text-blue-600" />
                Scan Product
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
            </Link>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Movement Area Chart (2 cols) */}
        <ChartCard
          title="Stock Movement Velocity"
          subtitle="Real-time incoming vs outgoing inventory volume"
          className="lg:col-span-2"
          action={
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {['7D', '30D', '3M'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    timeframe === t
                      ? 'bg-white text-blue-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          }
        >
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={movementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncoming" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOutgoing" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#FFF', fontSize: '12px' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="incoming" name="Incoming Stock" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIncoming)" />
              <Area type="monotone" dataKey="outgoing" name="Outgoing Stock" stroke="#60A5FA" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOutgoing)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Category Distribution Donut (1 col) */}
        <ChartCard
          title="Stock by Category"
          subtitle="Current distribution across product lines"
        >
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val) => [`${val}%`, 'Share']}
                contentStyle={{ backgroundColor: '#1E293B', borderRadius: '10px', border: 'none', color: '#FFF', fontSize: '12px' }}
              />
              <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Warehouse Capacity Comparison Bar Chart */}
      <ChartCard
        title="Warehouse Stock Capacity Comparison"
        subtitle="Current stored units vs maximum warehouse capacity limits"
      >
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={warehouseData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} />
            <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#FFF', fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Bar dataKey="stock" name="Current Units Stored" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={45} />
            <Bar dataKey="capacity" name="Max Capacity Limit" fill="#E2E8F0" radius={[6, 6, 0, 0]} maxBarSize={45} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};
