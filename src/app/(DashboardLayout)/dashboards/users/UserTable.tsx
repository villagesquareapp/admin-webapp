"use client";

import ReusableTable from "@/app/components/shared/ReusableTable";
import { formatDate } from "@/utils/dateUtils";
import { Icon } from "@iconify/react";
import { IconDotsVertical } from "@tabler/icons-react";
import { createColumnHelper } from "@tanstack/react-table";
import { Dropdown } from "flowbite-react";
import Image from "next/image";

const UserTable = ({
  users,
  totalPages,
  currentPage,
  pageSize,
}: {
  users: IUsersResponse | null;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  if (!users) return <div>No users found</div>;
  const columnHelper = createColumnHelper<IUsers>();

  const columns = [
    columnHelper.accessor("user_details.profile.profile_picture", {
      cell: (info) => (
        <div className="flex gap-3 items-center">
          <div className="relative size-10 rounded-full">
            <Image
              src={info.getValue()}
              alt="icon"
              fill
              className="rounded-full object-cover"
            />
          </div>

          <div className="truncat line-clamp-2 sm:max-w-56">
            <h6 className="text-base">{info.row.original.user_details.profile.username}</h6>
          </div>
        </div>
      ),
      header: () => <span>User</span>,
    }),
    columnHelper.accessor("user_details.profile.followers", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">{info.getValue() || 0}</p>
      ),
      header: () => <span>Followers</span>,
    }),
    columnHelper.accessor("user_details.shop.number_of_orders", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">{info.getValue() || 0}</p>
      ),
      header: () => <span>Orders</span>,
    }),
    columnHelper.accessor("user_details.shop.number_of_products", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">{info.getValue() || 0}</p>
      ),
      header: () => <span>Products</span>,
    }),
    columnHelper.accessor("user_details.posts", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">
          {info.row.original.user_details.posts.length || 0}
        </p>
      ),
      header: () => <span>Posts</span>,
    }),
    columnHelper.accessor("user_details.profile.created_at", {
      cell: (info) => {
        return (
          <p className="text-darklink dark:text-bodytext text-sm">
            {formatDate(info.getValue())}
          </p>
        );
      },
      header: () => <span>Date Joined</span>,
    }),
  ];
  return (
    <div className="col-span-12">
      <ReusableTable
        tableData={users?.data && Array.isArray(users?.data) ? users?.data : []}
        columns={columns}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
      />
    </div>
  );
};

export default UserTable;
