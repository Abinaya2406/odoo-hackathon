import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiService } from '../../services/aiService';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { LoadingState } from '../../components/LoadingState';
import { formatDate } from '../../utils/formatters';
import { AlertTriangle, CheckCircle2, Eye, ShieldAlert } from 'lucide-react';

export const AnomalyDetectionPage = () => {
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    aiService.getAnomalies().then((data) => {
      if (mounted) {
        setAnomalies(Array.isArray(data) ? data : []);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleMarkReviewed = async (id) => {
    try {
      await aiService.markAnomalyReviewed(id);
      setAnomalies((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'Reviewed' } : a))
      );
      showSuccess(`Anomaly ${id} marked as Reviewed & Dismissed.`);
    } catch (err) {
      showError(err.message || 'Failed to update anomaly status.');
    }
  };

  if (loading) return <LoadingState message="Scanning movement ledger for anomalies..." />;

  const safeAnomalies = Array.isArray(anomalies) ? anomalies : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900">AI Inventory Anomaly Detection</h2>
          <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Active Watchdog
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">Detects unusual velocity shifts, unrecorded dispatches, and warehouse discrepancies</p>
      </div>

      <div className="space-y-4">
        {safeAnomalies.map((anom) => (
          <Card
            key={anom.id}
            className={`border-l-4 ${
              anom.severity === 'High' ? 'border-l-rose-500' : 'border-l-amber-500'
            }`}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-base">{anom.productName}</span>
                  <Badge status={anom.severity === 'High' ? 'Critical' : 'Waiting'} size="sm" />
                  <span className="text-xs font-mono text-slate-400">({anom.sku})</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                  <span className="bg-rose-50 text-rose-900 px-2.5 py-1 rounded-md border border-rose-200">
                    Detected Shift: <strong>{anom.detectedQty} Units</strong>
                  </span>
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                    Expected Normal Velocity: {anom.normalRange}
                  </span>
                  <span className="text-slate-400">Flagged Date: {formatDate(anom.date)}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  <strong>AI Analysis:</strong> {anom.notes}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  icon={Eye}
                  onClick={() => navigate('/operations/move-history')}
                >
                  View Movement Log
                </Button>

                {anom.status !== 'Reviewed' ? (
                  <Button
                    size="sm"
                    variant="primary"
                    icon={CheckCircle2}
                    onClick={() => handleMarkReviewed(anom.id)}
                  >
                    Mark as Reviewed
                  </Button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    Reviewed & Verified
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
