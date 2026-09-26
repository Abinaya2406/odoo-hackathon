import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { anomalyService } from '../../services/anomalyService';
import { useToast } from '../../context/ToastContext';
import { KPICard } from '../../components/KPICard';
import { LoadingState } from '../../components/LoadingState';
import { AnomalyCard } from '../../components/ai/AnomalyCard';
import { AnomalyDetails } from '../../components/ai/AnomalyDetails';
import { AnomalyFilters } from '../../components/ai/AnomalyFilters';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  ArrowRightLeft,
  SlidersHorizontal,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const AnomalyDetection = () => {
  const [searchParams] = useSearchParams();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [anomalies, setAnomalies] = useState([]);
  const [kpis, setKpis] = useState({
    totalAnomalies: 0,
    criticalAnomalies: 0,
    unusualStockMovements: 0,
    quantityVariations: 0
  });

  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    severity: 'All',
    warehouse: 'All',
    eventType: 'All',
    status: 'All',
    search: searchParams.get('product') || ''
  });

  const loadData = async (currentFilters) => {
    try {
      const [list, metrics] = await Promise.all([
        anomalyService.getAnomalies(currentFilters),
        anomalyService.getAnomalyKPIs()
      ]);
      setAnomalies(Array.isArray(list) ? list : []);
      if (metrics) setKpis(metrics);
    } catch (err) {
      console.error('Error fetching anomalies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(filters);
  }, [filters]);

  const handleSelectAnomaly = (anomaly) => {
    setSelectedAnomaly(anomaly);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await anomalyService.updateStatus(id, newStatus);
      showSuccess(`Anomaly #${id} marked as "${newStatus}".`);
      setIsModalOpen(false);
      loadData(filters);
    } catch (err) {
      showError('Failed to update anomaly status.');
    }
  };

  const handleResetFilters = () => {
    setFilters({
      severity: 'All',
      warehouse: 'All',
      eventType: 'All',
      status: 'All',
      search: ''
    });
  };

  if (loading) return <LoadingState message="Auditing ledger transactions for anomalous patterns..." />;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              AI Inventory Anomaly Detection
            </h2>
            <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              Continuous Watchdog
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatically isolates velocity anomalies, unauthorized decrements, and irregular stock transfers
          </p>
        </div>
      </div>

      {/* KPI Cards (4 metrics required) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Anomalies"
          value={kpis.totalAnomalies}
          change="Flagged events"
          changeType="neutral"
          icon={ShieldAlert}
          color="blue"
          subtext="Total transaction discrepancies"
        />
        <KPICard
          title="Critical Anomalies"
          value={kpis.criticalAnomalies}
          change="Urgent review"
          changeType="decrease"
          icon={Flame}
          color="red"
          subtext="High financial or stock risk"
        />
        <KPICard
          title="Unusual Stock Movements"
          value={kpis.unusualStockMovements}
          change="Issues & receipts"
          changeType="neutral"
          icon={ArrowRightLeft}
          color="yellow"
          subtext="Deviation from order baseline"
        />
        <KPICard
          title="Quantity Variations"
          value={kpis.quantityVariations}
          change="Cycle count spikes"
          changeType="neutral"
          icon={SlidersHorizontal}
          color="purple"
          subtext="Repeated manual adjustments"
        />
      </div>

      {/* Filter Component */}
      <AnomalyFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* Anomaly Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span className="font-semibold text-slate-700">
            Detected Outlier Events ({anomalies.length})
          </span>
          <span>Click any card to inspect detection reasoning & comparative chart</span>
        </div>

        {anomalies.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No Anomalies Matching Current Filter</h4>
            <p className="text-xs text-slate-400 mt-1">All movement ledger transactions match normal operational baselines.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {anomalies.map((anom) => (
              <AnomalyCard
                key={anom.id}
                anomaly={anom}
                isSelected={selectedAnomaly?.id === anom.id}
                onSelect={handleSelectAnomaly}
                onQuickReview={(id) => handleUpdateStatus(id, 'Reviewed')}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Inspection Modal */}
      <AnomalyDetails
        anomaly={selectedAnomaly}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};
