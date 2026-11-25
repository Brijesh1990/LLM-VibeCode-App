import React, { useState, useMemo } from 'react';
import { ArrowUpDown } from 'lucide-react';
import EmptyState from './EmptyState';
import Pagination from './Pagination';

export default function DataTable({
  columns = [],
  data = [],
  pageSize = 10,
  emptyTitle = 'No records available',
  emptyDescription = 'No matching entries were found in the database.',
}) {
  const [page, setPage] = useState(1);
  const [sortCol, setSortCol] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  const sortedData = useMemo(() => {
    if (!sortCol) return data;
    return [...data].sort((a, b) => {
      const va = a[sortCol] ?? '';
      const vb = b[sortCol] ?? '';
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortAsc ? va - vb : vb - va;
      }
      return sortAsc
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
  }, [data, sortCol, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const handleSort = (accessor) => {
    if (!accessor) return;
    if (sortCol === accessor) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(accessor);
      setSortAsc(true);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/80">
              {columns.map((col, idx) => (
                <th
                  key={col.header || idx}
                  onClick={() => col.accessor && handleSort(col.accessor)}
                  className={`px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 ${
                    col.accessor ? 'cursor-pointer hover:text-slate-900 select-none' : ''
                  }`}
                >
                  <div className="inline-flex items-center gap-1.5">
                    {col.header}
                    {col.accessor && <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {paginated.map((row, rIdx) => (
              <tr key={row.id || rIdx} className="hover:bg-indigo-50/30 transition-colors">
                {columns.map((col, cIdx) => (
                  <td key={cIdx} className="px-4 py-3.5 text-slate-700 align-middle">
                    {col.render ? col.render(row) : row[col.accessor] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
