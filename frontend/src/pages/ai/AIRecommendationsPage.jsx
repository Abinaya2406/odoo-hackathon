import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiService } from '../../services/aiService';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { LoadingState } from '../../components/LoadingState';
import { Sparkles, ArrowRight, Lightbulb, RefreshCw, ShieldAlert } from 'lucide-react';

export const AIRecommendationsPage = () => {
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    aiService.getRecommendations().then((data) => {
      if (mounted) {
        setRecommendations(Array.isArray(data) ? data : []);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleApplyAction = (rec) => {
    if (rec.actionType === 'REORDER_ITEM') {
      showSuccess(`Reorder request initiated for product ${rec.productId}`);
      navigate('/ai/reorder');
    } else if (rec.actionType === 'TRANSFER_STOCK') {
      showSuccess('Initiating internal stock transfer wizard...');
      navigate('/operations/transfers/create');
    } else if (rec.actionType === 'UPDATE_MIN_STOCK') {
      showSuccess(`Product safety stock updated according to AI recommendation.`);
      navigate(`/products/${rec.productId}/edit`);
    } else if (rec.actionType === 'AUDIT_ANOMALY') {
      navigate('/ai/anomalies');
    } else {
      showSuccess('Recommendation applied successfully!');
    }
  };

  if (loading) return <LoadingState message="Synthesizing AI inventory optimization recommendations..." />;

  const safeRecs = Array.isArray(recommendations) ? recommendations : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900">Actionable AI Recommendations</h2>
          <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-indigo-600" /> Executive Insights
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">Prioritized machine-learning actions to optimize capital, eliminate stockouts, and rebalance stock</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {safeRecs.map((rec) => (
          <Card key={rec.id} className="flex flex-col justify-between hover:border-blue-300 transition-colors">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> {rec.type}
                </span>
                <Badge status={rec.badgeColor || 'info'}>{rec.impact}</Badge>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2">{rec.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">{rec.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <span className="text-[11px] font-semibold text-slate-400">Automated One-Click Action</span>
              <Button
                size="sm"
                variant="primary"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => handleApplyAction(rec)}
              >
                {rec.actionText}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
