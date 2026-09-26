import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { EmptyState } from './EmptyState';

export const Table = React.memo(({
  columns = [],
  data = [],
  keyField = 'id',
  sortColumn,
  sortDirection,
  onSort,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items matching your request.',
  emptyAction,
  loading = false
}) => {
  const safeColumns = Array.isArray(columns) ? columns : [];
  const safeData = Array.isArray(data) ? data : [];

  const handleSort = (colKey) => {
    if (onSort && colKey) {
      onSort(colKey);
    }
  };

  if (safeData.length === 0 && !loading) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            {safeColumns.map((col, idx) => (
              <th
                key={col.key || `col-${idx}`}
                className={`py-3.5 px-4 ${col.sortable ? 'cursor-pointer select-none hover:bg-slate-100 transition-colors' : ''} ${col.headerClassName || ''}`}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className="flex items-center gap-1.5">
                  <span>{col.label}</span>
                  {col.sortable && (
                    <span className="text-slate-400">
                      {sortColumn === col.key ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
          {safeData.map((row, rowIdx) => {
            const rowKey = row[keyField] || `row-${rowIdx}`;
            return (
              <tr
                key={rowKey}
                className="hover:bg-blue-50/40 transition-colors duration-150 group"
              >
                {safeColumns.map((col, colIdx) => (
                  <td
                    key={`cell-${rowKey}-${col.key || colIdx}`}
                    className={`py-3 px-4 ${col.className || ''}`}
                  >
                    {col.render ? col.render(row[col.key], row, rowIdx) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

Table.displayName = 'Table';
