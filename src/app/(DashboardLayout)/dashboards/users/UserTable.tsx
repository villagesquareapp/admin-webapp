"use client";

import ReusableTable from "@/app/components/shared/ReusableTable";
import { formatDate } from "@/utils/dateUtils";
import { createColumnHelper } from "@tanstack/react-table";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

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
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleRowClick = (user: IUsers) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("username", user.user_details.profile.username);
    router.push(`?${params.toString()}`);
  };

  if (!users) return <div>No users found</div>;
  const columnHelper = createColumnHelper<IUsers>();

  const columns = [
    columnHelper.accessor("user_details.profile.profile_picture", {
      cell: (info) => (
        <div className="flex gap-3 items-center">
          <div className="relative size-12 rounded-full">
            {!info.row.original.user_details.profile.last_online && (
              <div className="size-3 rounded-full bg-green-500 absolute bottom-0 right-1 z-10"></div>
            )}
            <Image
              src={info.getValue()}
              alt="icon"
              fill
              className="rounded-full object-cover"
            />
          </div>

          <div className="truncat line-clamp-2 sm:max-w-56 flex flex-col">
            <h6 className="text-base">{info.row.original.user_details.profile.name}</h6>
            <p className="text-sm text-darklink dark:text-bodytext">
              @{info.row.original.user_details.profile.username}
            </p>
          </div>
        </div>
      ),
      header: () => <span>Name</span>,
    }),
    columnHelper.accessor("user_details.profile.email", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">{info.getValue() || "-"}</p>
      ),
      header: () => <span>Email Address</span>,
    }),
    columnHelper.accessor("user_details.posts", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm text-center">
          {info.row.original.user_details.posts.length || 0}
        </p>
      ),
      header: () => <span>Posts</span>,
    }),
    columnHelper.accessor("user_details.profile.followers", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm text-center">
          {info.getValue() || 0}
        </p>
      ),
      header: () => <span>Followers</span>,
    }),
    columnHelper.accessor("user_details.profile.status", {
      cell: (info) => {
        const status = info.getValue();
        const statusStyles = {
          active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          suspended: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
          inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
        };

        return (
          <span
            className={`text-sm px-3 py-1 capitalize rounded-full w-fit ${statusStyles[status]}`}
          >
            {status}
          </span>
        );
      },
      header: () => <span>Status</span>,
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
        onRowClick={handleRowClick}
      />
    </div>
  );
};

export default UserTable;
