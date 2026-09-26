import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { LoadingState } from '../../components/LoadingState';
import {
  Bell,
  CheckCircle2,
  Trash2,
  Sparkles,
  AlertTriangle,
  Info,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export const NotificationsPage = () => {
  const { showSuccess } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All'); // All | Unread | Critical | AI Alerts

  useEffect(() => {
    let mounted = true;
    notificationService.getNotifications().then((data) => {
      if (mounted) {
        setNotifications(Array.isArray(data) ? data : []);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleMarkRead = async (id) => {
    const updated = await notificationService.markAsRead(id);
    setNotifications(updated);
    showSuccess('Notification marked as read.');
  };

  const handleMarkAllRead = async () => {
    const updated = await notificationService.markAllAsRead();
    setNotifications(updated);
    showSuccess('All notifications marked as read.');
  };

  const handleDelete = async (id) => {
    const updated = await notificationService.deleteNotification(id);
    setNotifications(updated);
    showSuccess('Notification deleted.');
  };

  if (loading) return <LoadingState message="Fetching notifications..." />;

  const safeNotifs = Array.isArray(notifications) ? notifications : [];

  const filteredNotifs = safeNotifs.filter((n) => {
    if (filterType === 'Unread') return !n.read;
    if (filterType === 'Critical') return n.type === 'Critical' || String(n.type).includes('Critical');
    if (filterType === 'AI Alerts') return n.type === 'AI' || String(n.type).includes('Prediction') || String(n.type).includes('Anomaly') || String(n.type).includes('Recommendation');
    return true;
  });

  const getNotifIcon = (type) => {
    switch (type) {
      case 'Critical':
      case 'Critical Stock Prediction':
        return <AlertCircle className="w-5 h-5 text-rose-600" />;
      case 'Inventory Anomaly':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      case 'Stockout Prediction':
        return <Sparkles className="w-5 h-5 text-amber-600" />;
      case 'AI Recommendation':
      case 'AI':
        return <Sparkles className="w-5 h-5 text-indigo-600" />;
      case 'Warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Notification Center</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time system alerts, critical stockouts, and AI predictions</p>
        </div>

        <Button variant="outline" icon={CheckCircle2} onClick={handleMarkAllRead}>
          Mark All as Read
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {['All', 'Unread', 'Critical', 'AI Alerts'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === t
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <p className="text-xs text-slate-500 py-8 text-center bg-white rounded-xl border border-slate-200">
            No notifications matching this filter.
          </p>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border transition-all flex items-start gap-4 ${
                !n.read ? 'bg-blue-50/40 border-blue-200 shadow-2xs' : 'bg-white border-slate-200'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white border border-slate-100 shrink-0 shadow-2xs">
                {getNotifIcon(n.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">{n.timestamp}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>

                {n.actionUrl && (
                  <Link
                    to={n.actionUrl}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 pt-1"
                  >
                    <span>Inspect Target Record</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!n.read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                    title="Mark as Read"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                  title="Delete Alert"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
