"use client";

import ReusableTable from "@/app/components/shared/ReusableTable";
import { DetailComp, UserDetailsComp } from "@/app/components/shared/TableSnippets";
import { formatDate } from "@/utils/dateUtils";
import { createColumnHelper } from "@tanstack/react-table";
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

  const handleRowClick = (user: IUser) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("userId", user.user_details.profile.id);
    router.replace(`?${params.toString()}`);
  };

  if (!users) return <div>No users found</div>;
  const columnHelper = createColumnHelper<IUser>();

  const columns = [
    columnHelper.accessor("user_details.profile.id", {
      cell: (info) => (
        <UserDetailsComp
          user={{
            name: info.row.original.user_details.profile.name,
            username: info.row.original.user_details.profile.username,
            email: info.row.original.user_details.profile.email,
            last_online: info.row.original.user_details.profile.last_online,
            profile_picture: info.row.original.user_details.profile.profile_picture,
            premium: info.row.original.user_details.profile.premium,
            check_mark: info.row.original.user_details.profile.check_mark,
          }}
          showPremiumAndCheckMark
          showActive
        />
      ),
      header: () => <span>Name</span>,
    }),
    columnHelper.accessor("user_details.profile.email", {
      cell: (info) => <DetailComp detail={info.getValue()} />,
      header: () => <span>Email</span>,
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
