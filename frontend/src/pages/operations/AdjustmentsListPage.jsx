import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { operationService } from '../../services/operationService';
import { Table } from '../../components/Table';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { SearchBar } from '../../components/SearchBar';
import { LoadingState } from '../../components/LoadingState';
import { formatDateTime } from '../../utils/formatters';
import { Plus, ListFilter, AlertCircle } from 'lucide-react';

export const AdjustmentsListPage = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    operationService.getAdjustments().then((data) => {
      if (mounted) {
        setAdjustments(Array.isArray(data) ? data : []);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredAdjustments = (Array.isArray(adjustments) ? adjustments : []).filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.id.toLowerCase().includes(q) ||
      a.productName.toLowerCase().includes(q) ||
      a.reason.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      key: 'id',
      label: 'Adjustment ID',
      render: (val) => <span className="font-mono font-bold text-blue-600">{val}</span>
    },
    {
      key: 'productName',
      label: 'Product',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-slate-800">{val}</span>
          <span className="block text-xs text-slate-500">{row.warehouseName || 'Warehouse'}</span>
        </div>
      )
    },
    {
      key: 'systemQty',
      label: 'System Qty',
      render: (val) => <span className="text-slate-600 font-mono">{val}</span>
    },
    {
      key: 'physicalQty',
      label: 'Physical Count',
      render: (val) => <span className="font-bold text-slate-900 font-mono">{val}</span>
    },
    {
      key: 'difference',
      label: 'Variance Difference',
      render: (val) => {
        const num = Number(val) || 0;
        return (
          <span
            className={`font-extrabold font-mono px-2 py-0.5 rounded-md text-xs ${
              num > 0
                ? 'bg-emerald-50 text-emerald-700'
                : num < 0
                ? 'bg-rose-50 text-rose-700'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {num > 0 ? `+${num}` : num}
          </span>
        );
      }
    },
    {
      key: 'reason',
      label: 'Adjustment Reason',
      render: (val) => <span className="text-xs text-slate-700">{val}</span>
    },
    {
      key: 'date',
      label: 'Adjusted At',
      render: (val) => <span className="text-xs text-slate-500">{formatDateTime(val)}</span>
    }
  ];

  if (loading) return <LoadingState message="Fetching stock adjustment records..." />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Stock Inventory Adjustments</h2>
          <p className="text-xs text-slate-500 mt-0.5">Reconcile physical stock counts with system registers</p>
        </div>
        <Link to="/operations/adjustments/create">
          <Button variant="primary" icon={Plus}>
            New Stock Adjustment
          </Button>
        </Link>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by adjustment ID, product name, or reason..."
      />

      <Table
        columns={columns}
        data={filteredAdjustments}
        emptyTitle="No adjustments found"
        emptyDescription="Create a stock adjustment to reconcile discrepancies found during physical audits."
      />
    </div>
  );
};
