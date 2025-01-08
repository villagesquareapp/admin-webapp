"use client";

import ReusableTable from "@/app/components/shared/ReusableTable";
import { formatDate } from "@/utils/dateUtils";
import { createColumnHelper } from "@tanstack/react-table";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import PremiumIcon from "/public/images/svgs/vs-svgs/premium.svg";
import CheckBadgeIcon from "/public/images/svgs/vs-svgs/check-badge.svg";

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

  const handleRowClick = (user: IUser) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("userId", user.user_details.profile.id);
    router.push(`?${params.toString()}`);
  };

  if (!users) return <div>No users found</div>;
  const columnHelper = createColumnHelper<IUser>();

  const columns = [
    columnHelper.accessor("user_details.profile.id", {
      cell: (info) => (
        <div className="flex gap-3 items-center">
          <div className="relative size-12 rounded-full">
            {!info.row.original.user_details.profile.last_online && (
              <div className="size-3 rounded-full bg-green-500 absolute bottom-0 right-1 z-10"></div>
            )}
            <Image
              src={info.row.original.user_details.profile.profile_picture}
              alt="icon"
              fill
              className="rounded-full object-cover"
            />
          </div>

          <div className="truncat line-clamp-2 sm:max-w-56 flex flex-col">
            <div className="flex items-center gap-1">
              <h6 className="text-base">{info.row.original.user_details.profile.name}</h6>
              {info.row.original.user_details.profile.checkmark && (
                <Image src={CheckBadgeIcon} alt="premium" width={25} height={25} />
              )}
              {info.row.original.user_details.profile.premium && (
                <Image
                  src={PremiumIcon}
                  alt="premium"
                  className="-ml-1.5"
                  width={18}
                  height={18}
                />
              )}
            </div>
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
        <p className="text-darklink dark:text-bodytext text-sm">
          {info.row.original.user_details.posts.length || 0}
        </p>
      ),
      header: () => <span>Posts</span>,
    }),
    columnHelper.accessor("user_details.profile.followers", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">{info.getValue() || 0}</p>
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
