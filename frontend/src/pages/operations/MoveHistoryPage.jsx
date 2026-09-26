import React, { useState, useEffect } from 'react';
import { operationService } from '../../services/operationService';
import { Table } from '../../components/Table';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { SearchBar } from '../../components/SearchBar';
import { FilterBar } from '../../components/FilterBar';
import { LoadingState } from '../../components/LoadingState';
import { useToast } from '../../context/ToastContext';
import { formatDateTime } from '../../utils/formatters';
import { Download, History, ArrowRight } from 'lucide-react';

export const MoveHistoryPage = () => {
  const { showSuccess } = useToast();
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    let mounted = true;
    operationService.getMoveHistory().then((data) => {
      if (mounted) {
        setMoves(Array.isArray(data) ? data : []);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleExportCSV = () => {
    const headers = ['Move ID', 'Date', 'Transaction ID', 'Product', 'SKU', 'Action', 'Quantity', 'From', 'To', 'User', 'Status'];
    const rows = filteredMoves.map((m) => [
      m.id,
      m.date,
      m.transactionId,
      `"${m.productName}"`,
      m.sku,
      m.action,
      m.quantity,
      `"${m.fromLocation}"`,
      `"${m.toLocation}"`,
      m.user,
      m.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockSense_Move_History_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess('Stock move ledger exported to CSV successfully!');
  };

  const filteredMoves = (Array.isArray(moves) ? moves : []).filter((m) => {
    let match = true;
    if (search.trim()) {
      const q = search.toLowerCase();
      match =
        m.id.toLowerCase().includes(q) ||
        m.transactionId.toLowerCase().includes(q) ||
        m.productName.toLowerCase().includes(q) ||
        m.fromLocation.toLowerCase().includes(q) ||
        m.toLocation.toLowerCase().includes(q);
    }
    if (match && actionFilter) {
      match = m.action === actionFilter;
    }
    return match;
  });

  const columns = [
    {
      key: 'date',
      label: 'Timestamp',
      render: (val) => <span className="text-xs text-slate-500 font-medium">{formatDateTime(val)}</span>
    },
    {
      key: 'transactionId',
      label: 'Ref TX ID',
      render: (val) => <span className="font-mono font-bold text-blue-600 text-xs">{val}</span>
    },
    {
      key: 'productName',
      label: 'Product',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-slate-900">{val}</span>
          <span className="block text-[11px] font-mono text-slate-400">{row.sku}</span>
        </div>
      )
    },
    {
      key: 'action',
      label: 'Action Type',
      render: (val) => <span className="font-bold text-slate-800 text-xs">{val}</span>
    },
    {
      key: 'quantity',
      label: 'Qty Delta',
      render: (val) => {
        const num = Number(val) || 0;
        return (
          <span
            className={`font-extrabold font-mono text-xs px-2 py-0.5 rounded-md ${
              num > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-800'
            }`}
          >
            {num > 0 ? `+${num}` : num}
          </span>
        );
      }
    },
    {
      key: 'flow',
      label: 'Movement Vector (From → To)',
      render: (_, row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <span className="truncate max-w-[120px]" title={row.fromLocation}>{row.fromLocation}</span>
          <ArrowRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="truncate max-w-[120px] font-medium text-slate-800" title={row.toLocation}>{row.toLocation}</span>
        </div>
      )
    },
    {
      key: 'user',
      label: 'Operator',
      render: (val) => <span className="text-xs text-slate-500">{val}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge status={val} size="sm" />
    }
  ];

  if (loading) return <LoadingState message="Compiling complete stock move ledger..." />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Stock Move History Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">Comprehensive audit trail of receipts, deliveries, transfers, and adjustments</p>
        </div>
        <Button variant="outline" icon={Download} onClick={handleExportCSV}>
          Export Ledger (CSV)
        </Button>
      </div>

      <div className="space-y-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by transaction ID, product name, origin/destination location..."
        />

        <FilterBar
          filters={[
            {
              key: 'action',
              label: 'All Action Types',
              value: actionFilter,
              options: [
                { label: 'Receipt', value: 'Receipt' },
                { label: 'Delivery', value: 'Delivery' },
                { label: 'Internal Transfer', value: 'Internal Transfer' },
                { label: 'Stock Adjustment', value: 'Stock Adjustment' }
              ],
              onChange: setActionFilter
            }
          ]}
          onReset={() => {
            setSearch('');
            setActionFilter('');
          }}
        />
      </div>

      <Table
        columns={columns}
        data={filteredMoves}
        emptyTitle="No stock movement records"
        emptyDescription="All completed inventory transactions will be logged here automatically."
      />
    </div>
  );
};
