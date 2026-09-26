import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { productService } from '../../services/productService';
import { warehouseService } from '../../services/warehouseService';
import { useToast } from '../../context/ToastContext';
import { Table } from '../../components/Table';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { SearchBar } from '../../components/SearchBar';
import { FilterBar } from '../../components/FilterBar';
import { Pagination } from '../../components/Pagination';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { LoadingState } from '../../components/LoadingState';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Plus, Eye, Edit3, Trash2, Package } from 'lucide-react';

export const ProductListPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Sorting & Pagination
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [prods, whs] = await Promise.all([
          productService.getProducts(),
          warehouseService.getWarehouses()
        ]);
        if (mounted) {
          setProducts(Array.isArray(prods) ? prods : []);
          setWarehouses(Array.isArray(whs) ? whs : []);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productService.deleteProduct(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      showSuccess(`Product "${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
    } catch (err) {
      showError(err.message || 'Failed to delete product.');
    } finally {
      setDeleting(false);
    }
  };

  // Unique categories
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => p.category && set.add(p.category));
    return Array.from(set);
  }, [products]);

  // Filtered & Sorted list
  const filteredProducts = useMemo(() => {
    let list = Array.isArray(products) ? [...products] : [];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.supplier && p.supplier.toLowerCase().includes(q))
      );
    }

    if (categoryFilter) {
      list = list.filter((p) => p.category === categoryFilter);
    }

    if (warehouseFilter) {
      list = list.filter((p) => p.warehouseId === warehouseFilter);
    }

    if (statusFilter) {
      list = list.filter((p) => p.status === statusFilter);
    }

    // Sort
    list.sort((a, b) => {
      let valA = a[sortColumn] ?? '';
      let valB = b[sortColumn] ?? '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [products, search, categoryFilter, warehouseFilter, statusFilter, sortColumn, sortDirection]);

  // Paginated slice
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize);

  const tableColumns = [
    {
      key: 'name',
      label: 'Product',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
            <Package className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <Link
              to={`/products/${row.id}`}
              className="font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
            >
              {row.name}
            </Link>
            <span className="text-xs text-slate-500">{row.category} • {row.supplier}</span>
          </div>
        </div>
      )
    },
    {
      key: 'sku',
      label: 'SKU',
      sortable: true,
      render: (val) => <span className="font-mono text-xs font-medium text-slate-700">{val}</span>
    },
    {
      key: 'warehouseName',
      label: 'Warehouse & Location',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="block text-xs font-semibold text-slate-800">{row.warehouseName || 'Main WH'}</span>
          <span className="text-[11px] text-slate-500">{row.storageLocation || 'Zone A'}</span>
        </div>
      )
    },
    {
      key: 'currentStock',
      label: 'Current Stock',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-bold text-slate-900">{val}</span>
          <span className="text-xs text-slate-500 ml-1">{row.unit}</span>
          <span className="block text-[11px] text-slate-400">Min: {row.minStock}</span>
        </div>
      )
    },
    {
      key: 'unitPrice',
      label: 'Unit Price',
      sortable: true,
      render: (val) => <span className="font-medium text-slate-900">{formatCurrency(val)}</span>
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <Badge status={val} />
    },
    {
      key: 'lastUpdated',
      label: 'Last Updated',
      sortable: true,
      render: (val) => <span className="text-xs text-slate-500">{formatDateTime(val)}</span>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Link
            to={`/products/${row.id}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <Link
            to={`/products/${row.id}/edit`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Edit Product"
          >
            <Edit3 className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return <LoadingState message="Fetching StockSense product catalog..." />;
  }

  return (
    <div className="space-y-5">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Product Inventory Catalog</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage stock levels, SKUs, and storage locations across all hubs</p>
        </div>
        <Link to="/products/add">
          <Button variant="primary" icon={Plus}>
            Add New Product
          </Button>
        </Link>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-3">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          placeholder="Search by product name, SKU, category, supplier..."
        />

        <FilterBar
          filters={[
            {
              key: 'category',
              label: 'All Categories',
              value: categoryFilter,
              options: categories.map((c) => ({ label: c, value: c })),
              onChange: (v) => {
                setCategoryFilter(v);
                setCurrentPage(1);
              }
            },
            {
              key: 'warehouse',
              label: 'All Warehouses',
              value: warehouseFilter,
              options: warehouses.map((w) => ({ label: w.name, value: w.id })),
              onChange: (v) => {
                setWarehouseFilter(v);
                setCurrentPage(1);
              }
            },
            {
              key: 'status',
              label: 'Stock Status',
              value: statusFilter,
              options: [
                { label: 'In Stock', value: 'In Stock' },
                { label: 'Low Stock', value: 'Low Stock' },
                { label: 'Out of Stock', value: 'Out of Stock' }
              ],
              onChange: (v) => {
                setStatusFilter(v);
                setCurrentPage(1);
              }
            }
          ]}
          onReset={() => {
            setSearch('');
            setCategoryFilter('');
            setWarehouseFilter('');
            setStatusFilter('');
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Product Data Table */}
      <Table
        columns={tableColumns}
        data={paginatedData}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        emptyTitle="No products found"
        emptyDescription="Try clearing your search query or adjusting your category/warehouse filters."
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredProducts.length}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />

      {/* Confirmation Dialog for Delete */}
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action will remove the product and its inventory history.`}
        confirmText="Delete Product"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};
