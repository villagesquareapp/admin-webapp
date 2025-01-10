"use client";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDatabaseOff,
} from "@tabler/icons-react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button, Dropdown, Select } from "flowbite-react";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import CardBox from "./CardBox";

// Add this interface for filter dropdowns
interface FilterDropdown {
  label: string;
  key: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}

function ReusableTable({
  tableData,
  columns,
  totalPages = 1,
  currentPage = 1,
  pageSize = 20,
  dropdownItems,
  tableTitle,
  onRowClick,
  filterDropdowns,
}: {
  tableData: any[];
  columns: any[];
  totalPages?: number;
  currentPage?: number;
  pageSize?: number;
  dropdownItems?: string[];
  tableTitle?: string;
  onRowClick?: (row: any) => void;
  filterDropdowns?: FilterDropdown[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Add state for each filter
  const [filterValues, setFilterValues] = React.useState<{ [key: string]: string }>({});

  // Initialize filter values
  React.useEffect(() => {
    if (filterDropdowns) {
      const initialValues: { [key: string]: string } = {};
      filterDropdowns.forEach((filter) => {
        initialValues[filter.label] = filter.defaultValue || "";
      });
      setFilterValues(initialValues);
    }
  }, [filterDropdowns]);

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset to first page when filter changes
    params.set("page", "1");

    // Use router.replace instead of push
    router.replace(`?${params.toString()}`, {
      scroll: false,
    });
  };

  const table = useReactTable({
    data: tableData,
    columns,
    filterFns: {},
    state: {
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: pageSize,
      },
    },
    manualPagination: true,
    pageCount: totalPages,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    params.set("limit", String(pageSize));

    router.replace(`?${params.toString()}`, {
      scroll: false,
    });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    params.set("limit", String(newPageSize));

    router.replace(`?${params.toString()}`, {
      scroll: false,
    });
  };

  return (
    <>
      <CardBox className="border rounded-md md:rounded-3xl  shadow-md border-ld overflow-hidden">
        <div className="flex md:items-center md:justify-between mb-4">
          <div className="flex items-center gap-4 w-full justify-between flex-col md:flex-row">
            {tableTitle && <h5 className="card-title">{tableTitle}</h5>}
            <div className="flex items-center gap-3 flex-col md:flex-row">
              {/* Add the filter dropdowns */}
              {filterDropdowns && (
                <div className="flex items-center gap-3 flex-col md:flex-row">
                  {filterDropdowns.map((filter, index) => (
                    <div key={index} className="min-w-[200px]">
                      <Select
                        value={searchParams.get(filter.key) || ""}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        className="rounded-lg"
                        theme={{
                          field: {
                            select: {
                              base: "block w-full border disabled:cursor-not-allowed disabled:opacity-50 focus:ring-2 rounded-lg",
                              colors: {
                                gray: "bg-gray-50 border-gray-300 text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary dark:focus:ring-primary",
                              },
                            },
                          },
                        }}
                      >
                        {filter.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Move the existing dropdown to the right */}
            {dropdownItems && (
              <div>
                <Dropdown
                  label=""
                  dismissOnClick={false}
                  renderTrigger={() => (
                    <span className="h-9 w-9 flex justify-center items-center rounded-full hover:bg-lightprimary hover:text-primary cursor-pointer">
                      <HiOutlineDotsVertical size={22} />
                    </span>
                  )}
                >
                  {dropdownItems?.map((items, index) => {
                    return <Dropdown.Item key={index}>{items}</Dropdown.Item>;
                  })}
                </Dropdown>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-base text-ld font-semibold text-left border-b border-ld px-4 py-3"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border dark:divide-darkborder">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors cursor-pointer hover:bg-gray-800/10 dark:hover:bg-gray-50/10"
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="whitespace-nowrap py-3 px-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <IconDatabaseOff className="w-12 h-12 text-gray-400" />
                      <p className="text-lg font-medium">No data available</p>
                      <p className="text-sm text-gray-400">
                        There are no records to display at the moment.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="sm:flex gap-2 p-3 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-gray-700">{tableData.length} Rows</h1>
          </div>
          <div className="sm:flex items-center gap-2">
            <div className="flex">
              <h2 className="text-gray-700 pe-1">Page</h2>
              <h2 className="font-semibold text-gray-900">
                {currentPage} of {totalPages}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              | Go to page:
              <input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = e.target.value ? Number(e.target.value) : 1;
                  handlePageChange(page);
                }}
                className="w-16 form-control-input"
              />
            </div>
            <select
              value={pageSize}
              onChange={(e) => {
                handlePageSizeChange(Number(e.target.value));
              }}
              className="border w-20"
            >
              {[10, 15, 20, 25].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <div className="flex gap-2 mt-2 md:m-0">
              <Button
                size="small"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                <IconChevronsLeft className="text-ld" size={20} />
              </Button>
              <Button
                size="small"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <IconChevronLeft className="text-ld" size={20} />
              </Button>
              <Button
                size="small"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <IconChevronRight className="text-ld" size={20} />
              </Button>
              <Button
                size="small"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                <IconChevronsRight className="text-ld" size={20} />
              </Button>
            </div>
          </div>
        </div>
      </CardBox>
    </>
  );
}

export default ReusableTable;
