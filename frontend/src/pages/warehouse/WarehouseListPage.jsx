import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { warehouseService } from '../../services/warehouseService';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { LoadingState } from '../../components/LoadingState';
import { formatNumber } from '../../utils/formatters';
import { Warehouse, Plus, MapPin, User, ArrowRight, Boxes } from 'lucide-react';

export const WarehouseListPage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    warehouseService.getWarehouses().then((data) => {
      if (mounted) {
        setWarehouses(Array.isArray(data) ? data : []);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <LoadingState message="Fetching warehouse network nodes..." />;

  const safeWarehouses = Array.isArray(warehouses) ? warehouses : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Warehouse Network</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage distribution hubs, fulfillment depots, and storage capacity</p>
        </div>
        <Link to="/warehouse/add">
          <Button variant="primary" icon={Plus}>
            Add Warehouse Node
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {safeWarehouses.map((wh) => {
          const usedPct = Math.min(100, Math.round(((wh.totalQuantity || 0) / (wh.capacity || 10000)) * 100));
          return (
            <Card key={wh.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                      <Warehouse className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 line-clamp-1">{wh.name}</h3>
                      <span className="text-xs font-mono text-slate-400">{wh.code}</span>
                    </div>
                  </div>
                  <Badge status={wh.status || 'Active'} size="sm" />
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{wh.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Manager: {wh.manager}</span>
                  </div>
                </div>

                {/* Capacity Usage Progress Bar */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-600">Capacity Usage ({usedPct}%)</span>
                    <span className="text-slate-900 font-mono">
                      {formatNumber(wh.totalQuantity)} / {formatNumber(wh.capacity)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        usedPct > 85 ? 'bg-rose-500' : usedPct > 70 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${usedPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100">
                <Link
                  to={`/warehouse/${wh.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <span>Explore Storage Zones & Stock</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
