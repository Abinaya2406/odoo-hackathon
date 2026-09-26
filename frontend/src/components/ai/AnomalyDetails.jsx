import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { Badge } from '../Badge';
import { AnomalyChart } from './AnomalyChart';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Package,
  History,
  FileText,
  User,
  MapPin,
  Clock,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const AnomalyDetails = React.memo(({
  anomaly,
  isOpen,
  onClose,
  onUpdateStatus
}) => {
  const navigate = useNavigate();

  if (!anomaly) return null;

  const handleAction = (newStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(anomaly.id, newStatus);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>Anomaly Investigation #{anomaly.id}</span>
          <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
            {anomaly.severity}
          </span>
        </div>
      }
      subtitle={`Flagged on ${anomaly.dateTime} by AI Watchdog`}
      maxWidth="max-w-2xl"
      footer={
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 self-start">
            <Button
              size="sm"
              variant="outline"
              icon={FileText}
              onClick={() => {
                onClose();
                navigate('/operations/move-history');
              }}
            >
              View Ledger
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={Package}
              onClick={() => {
                onClose();
                navigate('/products');
              }}
            >
              View Product
            </Button>
          </div>

          <div className="flex items-center gap-2 self-end">
            <Button
              size="sm"
              variant="secondary"
              icon={XCircle}
              onClick={() => handleAction('Ignored')}
            >
              Ignore
            </Button>
            <Button
              size="sm"
              variant="danger"
              icon={AlertTriangle}
              onClick={() => handleAction('Confirmed')}
            >
              Confirm Anomaly
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={CheckCircle2}
              onClick={() => handleAction('Reviewed')}
            >
              Mark as Reviewed
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 text-left">
        {/* Header Summary Card */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {anomaly.eventType}
              </span>
              <h4 className="text-lg font-bold text-slate-900 mt-0.5">{anomaly.productName}</h4>
              <p className="text-xs text-slate-500 font-mono">SKU: {anomaly.sku} • Doc Ref: {anomaly.referenceDoc}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Status</span>
              <span className="text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-200 inline-block mt-0.5">
                {anomaly.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-200/80 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Normal Range</span>
              <span className="font-semibold text-slate-800">{anomaly.expectedRange}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Flagged Quantity</span>
              <span className="font-extrabold text-rose-600 text-sm">{anomaly.actualQuantity} {anomaly.unit}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Facility</span>
              <span className="font-medium text-slate-700 truncate block">{anomaly.warehouse}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Supervisor</span>
              <span className="font-medium text-slate-700 truncate block">{anomaly.user} ({anomaly.role})</span>
            </div>
          </div>
        </div>

        {/* Why was this detected section */}
        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2 text-rose-900">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <h5 className="text-xs font-bold uppercase tracking-wider">Why was this detected?</h5>
          </div>
          <p className="text-xs text-rose-950 leading-relaxed font-medium">
            "{anomaly.whyDetected}"
          </p>
          {anomaly.impactSummary && (
            <div className="mt-3 pt-2 border-t border-rose-200/60 text-xs text-rose-900">
              <strong>Operational Impact:</strong> {anomaly.impactSummary}
            </div>
          )}
        </div>

        {/* Comparative Chart */}
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <AnomalyChart
            chartData={anomaly.chartData}
            unit={anomaly.unit}
            normalMin={anomaly.normalMin}
            normalMax={anomaly.normalMax}
          />
        </div>
      </div>
    </Modal>
  );
});

AnomalyDetails.displayName = 'AnomalyDetails';
