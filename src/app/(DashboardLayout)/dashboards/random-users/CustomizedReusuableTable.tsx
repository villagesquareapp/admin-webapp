"use client";
import CardBox from "@/app/components/shared/CardBox";
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
import { Button, Checkbox, Dropdown, Select, TextInput } from "flowbite-react";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { FaSearch } from "react-icons/fa";
import { getSearchUser } from "@/app/api/user";

interface FilterDropdown {
  label: string;
  key: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}

function CustomizedReusableTable({
  tableData,
  columns,
  totalPages = 1,
  currentPage = 1,
  pageSize = 10,
  dropdownItems,
  tableTitle,
  onRowClick,
  filterDropdowns,
  extraButtons,
}: {
  tableData: any[];
  columns: any[];
  totalPages?: number;
  currentPage?: number;
  pageSize?: number;
  dropdownItems?: string[];
  tableTitle?: string;
  extraButtons?: React.ReactNode;
  onRowClick?: (row: any) => void;
  filterDropdowns?: FilterDropdown[];
}) {
  const [hasMounted, setHasMounted] = React.useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const [filterValues, setFilterValues] = React.useState<{
    [key: string]: string;
  }>({});
  const [hoveredRowId, setHoveredRowId] = React.useState<string | null>(null);
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const [query, setQuery] = React.useState<string>("");

  const [tableDataState, setTableDataState] = React.useState<any[]>(tableData); // local state

  React.useEffect(() => {
    setTableDataState(tableData);
  }, [tableData]);

  React.useEffect(() => {
    if (query.trim() === "") {
      setTableDataState(tableData);
    }
  }, [query, tableData]);

  React.useEffect(() => {
    if (filterDropdowns) {
      const initialValues: { [key: string]: string } = {};
      filterDropdowns.forEach((filter) => {
        initialValues[filter.label] = filter.defaultValue || "";
      });
      setFilterValues(initialValues);
    }
  }, [filterDropdowns]);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.replace(`?${params.toString()}`, {
      scroll: false,
    });
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      const response = await getSearchUser(query.trim());

      if (Array.isArray(response?.data)) {
        console.log("Search response raw:", response?.data);
        setTableDataState(response?.data);
      } else {
        setTableDataState([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setTableDataState([]);
    }
  };

  const table = useReactTable({
    data: tableDataState,
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

  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const toggleAllRows = () => {
    if (selectedRows.length === tableData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(tableData.map((_, idx) => String(idx)));
    }
  };

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <>
      <CardBox className="border rounded-md md:rounded-3xl shadow-md border-ld overflow-hidden">
        <div className="flex md:items-center md:justify-between mb-4">
          <div className="flex items-center gap-4 w-full justify-between flex-col md:flex-row">
            {tableTitle && <h5 className="card-title">{tableTitle}</h5>}
            <div className="flex items-center gap-3 flex-col md:flex-row ml-auto justify-end">
              {filterDropdowns && (
                <div className="flex items-center gap-3 flex-col md:flex-row">
                  {filterDropdowns.map((filter, index) => (
                    <div key={index} className="min-w-[200px]">
                      <Select
                        value={searchParams.get(filter.key) || ""}
                        onChange={(e) =>
                          handleFilterChange(filter.key, e.target.value)
                        }
                        className="rounded-lg"
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
              {extraButtons}
            </div>
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
                  {dropdownItems?.map((items, index) => (
                    <Dropdown.Item key={index}>{items}</Dropdown.Item>
                  ))}
                </Dropdown>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex w-full max-w-md items-center gap-2">
            {/* Input with Icon */}
            <TextInput
              id="search"
              type="text"
              placeholder="Search..."
              icon={FaSearch}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-grow"
            />

            {/* Search Button */}
            <Button color="primary" onClick={handleSearch}>
              Search
            </Button>
          </div>
          <Button size={"sm"}>Refresh</Button>
        </div>

        {selectedRows.length > 0 && (
          <div className="flex items-center justify-between px-4 pb-2">
            <div className="flex gap-1 items-center justify-center pl-6">
              <Checkbox
                checked={selectedRows.length === tableData.length}
                onChange={toggleAllRows}
                className="!size-6"
              />
              <p className="text-base">Select All</p>
            </div>
            <div className="flex gap-1 items-center justify-center">
              <Button color="success">
                Transfer Cowry to Selected Users ({selectedRows.length})
              </Button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  <th className="w-10"></th>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-base text-ld font-semibold text-left border-b border-ld px-4 py-3"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border dark:divide-darkborder">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`cursor-pointer border-b border-gray-300 dark:border-gray-600 relative transition-all duration-300 ${
                      hoveredRowId === row.id ||
                      selectedRows.includes(String(idx))
                        ? "bg-gray-200 dark:bg-gray-700"
                        : ""
                    }`}
                    onMouseEnter={() => setHoveredRowId(row.id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    <td className="">
                      <div
                        className={`absolute left-2 bottom-1 transition-opacity duration-300 ${
                          hoveredRowId === row.id ||
                          selectedRows.includes(String(idx))
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedRows.includes(String(idx))}
                          className="!size-6"
                          onChange={() => toggleRowSelection(String(idx))}
                        />
                      </div>
                    </td>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="whitespace-nowrap py-3">
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
                    className="text-center py-8 text-gray-500"
                  >
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
                onChange={(e) => handlePageChange(Number(e.target.value))}
                className="w-16 form-control-input"
              />
            </div>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="border w-24 h-10 rounded-md bg-gray-100 dark:bg-gray-800"
            >
              {[20, 40, 60, 80, 100].map((size) => (
                <option
                  key={size}
                  value={size}
                  className="bg-gray-100 dark:bg-gray-800"
                >
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

export default CustomizedReusableTable;
