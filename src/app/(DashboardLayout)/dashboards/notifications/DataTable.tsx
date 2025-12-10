import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { HiChevronLeft, HiChevronRight, HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import { MdDataset } from 'react-icons/md';

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  totalPages: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRowClick?: (row: TData) => void;
}

function DataTable<TData>({
  data,
  columns,
  totalPages,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onRowClick,
}: DataTableProps<TData>) {
  const [goToPage, setGoToPage] = useState<string>('');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  const handleGoToPage = () => {
    const pageNumber = parseInt(goToPage);
    if (pageNumber && pageNumber > 0 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
      setGoToPage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGoToPage();
    }
  };

  return (
    <div className="w-full">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white dark:bg-darkgray">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={`${
                    onRowClick
                      ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800'
                      : ''
                  } transition-colors`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-20 text-center"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-4 text-gray-400 dark:text-gray-500">
                      <MdDataset size={64} className="opacity-50" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                      No data available
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      There are no records to display at the moment.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        {/* Row Count */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold">{data.length} Rows</span>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-4">
          {/* Page Info */}
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page <span className="font-semibold">{currentPage}</span> of{' '}
            <span className="font-semibold">{totalPages || 1}</span>
          </span>

          {/* Go to Page */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Go to page:
            </span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={goToPage}
              onChange={(e) => setGoToPage(e.target.value)}
              onKeyPress={handleKeyPress}
              onBlur={handleGoToPage}
              className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="1"
            />
          </div>

          {/* Page Size Selector */}
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="p-2 rounded bg-cyan-500 hover:bg-cyan-600 text-white disabled:bg-gray-300 disabled:dark:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              <HiChevronDoubleLeft size={18} />
            </button>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded bg-cyan-500 hover:bg-cyan-600 text-white disabled:bg-gray-300 disabled:dark:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              <HiChevronLeft size={18} />
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded bg-cyan-500 hover:bg-cyan-600 text-white disabled:bg-gray-300 disabled:dark:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              <HiChevronRight size={18} />
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded bg-cyan-500 hover:bg-cyan-600 text-white disabled:bg-gray-300 disabled:dark:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              <HiChevronDoubleRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataTable;