import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { operationService } from '../../services/operationService';
import { Table } from '../../components/Table';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { SearchBar } from '../../components/SearchBar';
import { LoadingState } from '../../components/LoadingState';
import { formatDate } from '../../utils/formatters';
import { Plus, ArrowRight, RefreshCw, MapPin } from 'lucide-react';

export const TransfersListPage = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    operationService.getTransfers().then((data) => {
      if (mounted) {
        setTransfers(Array.isArray(data) ? data : []);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredTransfers = (Array.isArray(transfers) ? transfers : []).filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.id.toLowerCase().includes(q) ||
      t.productName.toLowerCase().includes(q) ||
      t.sourceWarehouseName.toLowerCase().includes(q) ||
      t.destinationWarehouseName.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      key: 'id',
      label: 'Transfer ID',
      render: (val) => <span className="font-mono font-bold text-blue-600">{val}</span>
    },
    {
      key: 'productName',
      label: 'Product',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-slate-800">{val}</span>
          <span className="block text-xs font-mono text-slate-500">Qty: {row.quantity} Units</span>
        </div>
      )
    },
    {
      key: 'flow',
      label: 'Source → Destination Flow',
      render: (_, row) => (
        <div className="flex items-center gap-2 text-xs">
          <div className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-medium">
            {row.sourceWarehouseName}
          </div>
          <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-800 font-medium">
            {row.destinationWarehouseName}
          </div>
        </div>
      )
    },
    {
      key: 'transferredBy',
      label: 'Operator',
      render: (val) => <span className="text-xs text-slate-600">{val}</span>
    },
    {
      key: 'date',
      label: 'Date',
      render: (val) => <span className="text-xs text-slate-500">{formatDate(val)}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge status={val} />
    }
  ];

  if (loading) return <LoadingState message="Fetching internal transfer logs..." />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Internal Stock Transfers</h2>
          <p className="text-xs text-slate-500 mt-0.5">Relocate stock between warehouses, distribution hubs, and storage racks</p>
        </div>
        <Link to="/operations/transfers/create">
          <Button variant="primary" icon={Plus}>
            New Transfer
          </Button>
        </Link>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by transfer ID, product name, or warehouse..."
      />

      <Table
        columns={columns}
        data={filteredTransfers}
        emptyTitle="No internal transfers recorded"
        emptyDescription="Create an internal transfer to rebalance inventory across warehouses."
      />
    </div>
  );
};
