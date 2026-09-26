import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import { operationService } from '../../services/operationService';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { LoadingState } from '../../components/LoadingState';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import {
  ArrowLeft,
  Edit3,
  Package,
  MapPin,
  Building2,
  Tag,
  TrendingUp,
  Brain,
  Sparkles,
  History,
  Boxes
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [prod, moveHistory] = await Promise.all([
          productService.getProductById(id),
          operationService.getMoveHistory()
        ]);
        if (mounted) {
          setProduct(prod);
          const relatedMoves = (Array.isArray(moveHistory) ? moveHistory : []).filter(
            (m) => m.productId === id
          );
          setMoves(relatedMoves);
        }
      } catch (err) {
        console.error('Error loading product details:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return <LoadingState message="Fetching product intelligence profile..." />;
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-slate-800">Product Not Found</h3>
        <p className="text-xs text-slate-500 mb-4">The requested product ID does not exist.</p>
        <Link to="/products">
          <Button variant="outline">Back to Products</Button>
        </Link>
      </div>
    );
  }

  // Stock History line data
  const historyChartData = [
    { date: 'Sep 1', stock: product.currentStock + 45 },
    { date: 'Sep 5', stock: product.currentStock + 30 },
    { date: 'Sep 10', stock: product.currentStock + 10 },
    { date: 'Sep 15', stock: product.currentStock + 50 },
    { date: 'Sep 20', stock: product.currentStock + 20 },
    { date: 'Sep 25', stock: product.currentStock }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/products"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">{product.name}</h2>
              <Badge status={product.status} />
            </div>
            <p className="text-xs font-mono text-slate-500 mt-0.5">
              SKU: {product.sku} • Category: {product.category}
            </p>
          </div>
        </div>

        <Link to={`/products/${product.id}/edit`}>
          <Button variant="outline" icon={Edit3}>
            Edit Details
          </Button>
        </Link>
      </div>

      {/* Grid: Core Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Current Stock</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{product.currentStock}</span>
            <span className="text-xs text-slate-500">{product.unit}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Min: {product.minStock} | Max: {product.maxStock}</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Unit Price</span>
          <span className="text-2xl font-bold text-slate-900">{formatCurrency(product.unitPrice)}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Valuation: {formatCurrency(product.currentStock * product.unitPrice)}</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Assigned Warehouse</span>
          <span className="text-sm font-bold text-slate-800 line-clamp-1">{product.warehouseName || 'Central WH'}</span>
          <span className="text-[11px] text-slate-500 mt-1 block flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            {product.storageLocation || 'Zone A'}
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Supplier</span>
          <span className="text-sm font-bold text-slate-800 line-clamp-1">{product.supplier}</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Reorder Qty: {product.reorderQty}</span>
        </div>
      </div>

      {/* AI Prediction Group & Stock History Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock History Line Chart */}
        <Card title="Stock Level History (30 Days)" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={historyChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', borderRadius: '10px', color: '#FFF', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="stock" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, fill: '#2563EB' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* AI Prediction Card */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-xl p-5 text-white shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-200" />
                <h4 className="text-sm font-bold tracking-wide">StockSense AI Predictive Card</h4>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">94.8% ACCURACY</span>
            </div>

            <div className="space-y-3 bg-white/10 p-3.5 rounded-lg text-xs backdrop-blur-xs">
              <div>
                <span className="text-blue-200 block text-[11px]">30-Day Expected Demand</span>
                <span className="text-xl font-extrabold">{product.currentStock * 2 + 35} Units</span>
              </div>
              <div>
                <span className="text-blue-200 block text-[11px]">Recommended Reorder Point</span>
                <span className="font-semibold text-emerald-300">Reorder {product.reorderQty || 100} units in 4 days</span>
              </div>
            </div>

            <p className="text-[11px] text-blue-100 mt-3 leading-relaxed">
              ML Model predicts high order velocity. Current stock will cover 12 days before safety buffer depletion.
            </p>
          </div>

          <Link to="/ai/reorder" className="mt-4">
            <Button variant="secondary" className="w-full text-xs font-bold text-blue-900 bg-white hover:bg-blue-50">
              Create Smart Purchase Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Transactions List */}
      <Card title="Recent Transactions & Stock Movements">
        {moves.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No recent transaction logs for this product.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {moves.map((move) => (
              <div key={move.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <span>{move.action} ({move.transactionId})</span>
                    <Badge status={move.status} size="sm" />
                  </div>
                  <span className="text-slate-500">{move.fromLocation} → {move.toLocation}</span>
                </div>
                <div className="text-right">
                  <span className={`font-bold ${move.quantity > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {move.quantity > 0 ? `+${move.quantity}` : move.quantity} {product.unit}
                  </span>
                  <span className="block text-[11px] text-slate-400">{formatDateTime(move.date)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
