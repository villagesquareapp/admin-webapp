'use client';

import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { Checkbox, Button } from 'flowbite-react';

type User = {
  name: string;
  username: string;
  email: string;
  posts: number;
  followers: number;
  dateJoined: string;
  avatar: string; // URL of profile image
};

const users: User[] = [
  {
    name: 'Abdullahi Musa Deleted',
    username: '@MrammiaDeleted',
    email: 'musabdulhim3Deleted@gmail.com',
    posts: 22,
    followers: 1,
    dateJoined: 'Dec 11, 2024',
    avatar: 'https://i.pravatar.cc/40?img=1',
  },
  {
    name: 'Ola Tester',
    username: '@olatester',
    email: 'olatester@gmail.com',
    posts: 65,
    followers: 6,
    dateJoined: 'Nov 26, 2024',
    avatar: 'https://i.pravatar.cc/40?img=2',
  },
  {
    name: 'Tester 001',
    username: '@tester001',
    email: 'tester001@gmail.com',
    posts: 12,
    followers: 2,
    dateJoined: 'Dec 19, 2024',
    avatar: 'https://i.pravatar.cc/40?img=3',
  },
  {
    name: 'Villagesquare Test 1 Real',
    username: '@villagesquaretest11',
    email: 'victorjonah199@gmail.com',
    posts: 5,
    followers: 0,
    dateJoined: 'Jan 25, 2025',
    avatar: 'https://i.pravatar.cc/40?img=4',
  },
];

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full" />
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-gray-400">{user.username}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: (info) => (
      <span className="truncate max-w-[150px] block">{info.getValue() as string}</span>
    ),
  },
  {
    accessorKey: 'posts',
    header: 'Posts',
  },
  {
    accessorKey: 'followers',
    header: 'Followers',
  },
  {
    accessorKey: 'dateJoined',
    header: 'Date Joined',
  },
];

export default function UserTable() {
  const [globalFilter, setGlobalFilter] = useState('');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const table = useReactTable({
    data: users,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) =>
      String(row.getValue(columnId)).toLowerCase().includes(filterValue.toLowerCase()),
  });

  const allRowIds = table.getRowModel().rows.map((row) => row.id);

  const toggleRowSelection = (rowId: string) => {
    setSelectedRows((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]
    );
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedRows(checked ? allRowIds : []);
  };

  return (
    <div className="p-6 text-white rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search..."
          className="px-3 py-2 text-black rounded-md w-64 bg-transparent border border-gray-300"
        />
        {selectedRows.length > 0 && (
          <Button color="success">
            Transfer Cowries to Newly Registered Users ({selectedRows.length})
          </Button>
        )}
      </div>

      <table className="w-full table-auto border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="text-left border-b border-gray-700">
              {selectedRows.length > 0 && headerGroup.headers.length > 0 && (
                <th className="w-12 px-3">
                  <Checkbox
                    checked={selectedRows.length === allRowIds.length}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                </th>
              )}
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="py-2 px-3 font-semibold">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => {
            const isHovered = hoveredRow === row.id;
            const isSelected = selectedRows.includes(row.id);

            return (
              <tr
                key={row.id}
                onMouseEnter={() => setHoveredRow(row.id)}
                onMouseLeave={() => setHoveredRow(null)}
                className={`border-b border-gray-800 transition-all duration-300 ${
                  isHovered || isSelected ? 'bg-gray-800' : ''
                }`}
              >
                {(isHovered || isSelected) && (
                  <td className="w-10 px-2 transition-all duration-300 ease-in-out">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleRowSelection(row.id)}
                    />
                  </td>
                )}
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-3 px-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}