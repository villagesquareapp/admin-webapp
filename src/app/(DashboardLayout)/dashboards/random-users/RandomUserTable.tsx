"use client";

import ReusableTable from "@/app/components/shared/ReusableTable";
import {
  DetailComp,
  UserDetailsComp,
} from "@/app/components/shared/TableSnippets";
import { formatDate } from "@/utils/dateUtils";
import { createColumnHelper } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import CustomizedReusableTable from "./CustomizedReusuableTable";
import { useEffect, useState, Suspense } from "react";
import { getRandomUsers } from "@/app/api/user";

const RandomUserTable = ({
  totalPages,
  currentPage,
  pageSize,
}: {
  totalPages?: number;
  currentPage?: number;
  pageSize?: number;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [users, setUsers] = useState<IRandomUsers[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;

  const fetchRandomUsers = async () => {
    try {
      setIsLoading(true);
      const response = await getRandomUsers(page, limit);
      setUsers(response?.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomUsers();
  }, [page, limit]);

  const handleRowClick = (user: IUser) => {
    // const params = new URLSearchParams(searchParams.toString());
    // params.set("userId", user.user_details.profile.id);
    // router.replace(`?${params.toString()}`);
  };

  const columnHelper = createColumnHelper<IRandomUsers>();

  const columns = [
    columnHelper.accessor("name", {
      cell: (info) => (
        <UserDetailsComp
          user={{
            name: info.row.original.name,
            username: info.row.original.username,
            email: info.row.original.email,
            last_online: info.row.original.last_online,
            profile_picture: info.row.original.profile_picture,
            premium: info.row.original.premium_verification_status,
            check_mark: info.row.original.checkmark_verification_status,
          }}
          showPremiumAndCheckMark
          showActive
        />
      ),
      header: () => <span>Name</span>,
    }),

    columnHelper.accessor("email", {
      cell: (info) => <DetailComp detail={info.getValue()} />,
      header: () => <span>Email</span>,
    }),

    columnHelper.accessor("referral_count", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">
          {info.getValue() || 0}
        </p>
      ),
      header: () => <span>Followers</span>,
    }),

    columnHelper.accessor("status", {
      cell: (info) => {
        type UserStatus = "active" | "suspended" | "inactive";
        const status: UserStatus = info.getValue() as UserStatus;
        const statusStyles = {
          active:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          suspended:
            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
          inactive:
            "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
        };
        return (
          <span
            className={`text-sm px-3 py-1 capitalize rounded-full w-fit ${
              statusStyles[status] || ""
            }`}
          >
            {status}
          </span>
        );
      },
      header: () => <span>Status</span>,
    }),

    columnHelper.accessor("created_at", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">
          {formatDate(info.getValue())}
        </p>
      ),
      header: () => <span>Date Joined</span>,
    }),
  ];
  return (
    <div className="col-span-12">
      <Suspense fallback={<div>Loading users...</div>}>
        <CustomizedReusableTable
          tableData={Array.isArray(users) ? users : []}
          columns={columns}
          totalPages={totalPages}
          currentPage={page}
          pageSize={limit}
          onRowClick={handleRowClick}
          onRefresh={fetchRandomUsers}
          isRefreshing={isLoading}
        />
      </Suspense>
    </div>
  );
};

export default RandomUserTable;
