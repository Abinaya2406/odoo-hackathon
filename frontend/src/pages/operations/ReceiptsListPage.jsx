import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { operationService } from '../../services/operationService';
import { useToast } from '../../context/ToastContext';
import { Table } from '../../components/Table';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { SearchBar } from '../../components/SearchBar';
import { LoadingState } from '../../components/LoadingState';
import { formatDate } from '../../utils/formatters';
import { Plus, CheckCircle2, FileText, Building2 } from 'lucide-react';

export const ReceiptsListPage = () => {
  const { showSuccess, showError } = useToast();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [validatingId, setValidatingId] = useState(null);

  useEffect(() => {
    let mounted = true;
    operationService.getReceipts().then((data) => {
      if (mounted) {
        setReceipts(Array.isArray(data) ? data : []);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleValidate = async (id) => {
    setValidatingId(id);
    try {
      const updated = await operationService.validateReceipt(id);
      setReceipts((prev) => prev.map((r) => (r.id === id ? updated : r)));
      showSuccess(`Receipt ${id} validated! Product stock levels updated upwards.`);
    } catch (err) {
      showError(err.message || 'Failed to validate receipt.');
    } finally {
      setValidatingId(null);
    }
  };

  const filteredReceipts = (Array.isArray(receipts) ? receipts : []).filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      r.supplier.toLowerCase().includes(q) ||
      r.warehouseName.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      key: 'id',
      label: 'Receipt ID',
      render: (val) => <span className="font-mono font-bold text-blue-600">{val}</span>
    },
    {
      key: 'supplier',
      label: 'Supplier',
      render: (val) => <span className="font-semibold text-slate-800">{val}</span>
    },
    {
      key: 'warehouseName',
      label: 'Destination Warehouse',
      render: (val) => <span className="text-xs text-slate-700">{val}</span>
    },
    {
      key: 'items',
      label: '# Line Items',
      render: (val) => <span className="font-medium text-slate-900">{Array.isArray(val) ? val.length : 0} Items</span>
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
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {row.status !== 'Done' && row.status !== 'Cancelled' ? (
            <Button
              size="sm"
              variant="primary"
              loading={validatingId === row.id}
              icon={CheckCircle2}
              onClick={() => handleValidate(row.id)}
            >
              Validate & Receive
            </Button>
          ) : (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Completed
            </span>
          )}
        </div>
      )
    }
  ];

  if (loading) return <LoadingState message="Fetching stock receipt records..." />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Inbound Stock Receipts</h2>
          <p className="text-xs text-slate-500 mt-0.5">Receive supplier shipments and restock inventory warehouses</p>
        </div>
        <Link to="/operations/receipts/create">
          <Button variant="primary" icon={Plus}>
            Create Receipt
          </Button>
        </Link>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by receipt ID, supplier, or warehouse..."
      />

      <Table
        columns={columns}
        data={filteredReceipts}
        emptyTitle="No receipts found"
        emptyDescription="Create a new receipt to record incoming supplier inventory."
      />
    </div>
  );
};
