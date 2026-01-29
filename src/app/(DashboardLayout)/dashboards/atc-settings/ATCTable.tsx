"use client";

import ReusableTable from "@/app/components/shared/ReusableTable";
import {
  DetailComp,
  UserDetailsComp,
} from "@/app/components/shared/TableSnippets";
import { formatDate } from "@/utils/dateUtils";
import { createColumnHelper } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
// import UserActions from "./UserActions";
import { getUserStatus } from "@/app/api/user";
import { useEffect, useState } from "react";
import ATCDetailsDialog from "./ATCDetailsDialog";

const ApplicationTable = ({
  applications,
  totalPages,
  currentPage,
  pageSize,
}: {
  applications: IATCApplicationsResponse | null;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<IATCApplication | null>(null);

  const [statuses, setStatuses] = useState<IUserStatusList[]>([]); 
  const [statusLoading, setStatusLoading] = useState<boolean>(false);

  const handleRowClick = (app: IATCApplication) => {
    setSelectedApplication(app);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedApplication(null);
  };

  useEffect(() => {
    const fetchStatuses = async () => {
      setStatusLoading(true);
      try {
        const res = await getUserStatus();
        setStatuses(res?.data || []);
        setStatusLoading(false);
      } catch (error) {
        console.error("Failed to load user statuses:", error);
      } finally {
        setStatusLoading(false);
      }
    };
    fetchStatuses();
  }, []);

  const columnHelper = createColumnHelper<IATCApplication>();

  const columns = [
    columnHelper.accessor("fullname", {
      cell: (info) => (
        <UserDetailsComp
          user={{
            name: info.row.original.fullname,
            username: info.row.original.user.username,
            email: info.row.original.occupation || "N/A",
            profile_picture: info.row.original.user.profile_picture,
          }}
          
          showPremiumAndCheckMark={false}
          showActive={false}
        />
      ),
      header: () => <span>Full Name</span>,
    }),
    columnHelper.accessor("occupation", {
      cell: (info) => <DetailComp detail={info.getValue()} />,
      header: () => <span>Occupation</span>,
    }),
    columnHelper.accessor("occupation_duration", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">
          {info.getValue() || "N/A"}
        </p>
      ),
      header: () => <span>Duration</span>,
    }),
    columnHelper.accessor("application_type", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm capitalize">
          {info.getValue() || "N/A"}
        </p>
      ),
      header: () => <span>Type</span>,
    }),
    columnHelper.accessor("status", {
      cell: (info) => {
        const status = info.getValue()?.toLowerCase();
        const statusStyles: { [key: string]: string } = {
          approved:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          pending:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
          declined:
            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        };

        return (
          <span
            className={`text-sm px-3 py-1 capitalize rounded-full w-fit ${statusStyles[status] || "bg-gray-100 text-gray-800"
              }`}
          >
            {status}
          </span>
        );
      },
      header: () => <span>Status</span>,
    }),

    columnHelper.accessor("created_at", {
      cell: (info) => {
        return (
          <p className="text-darklink dark:text-bodytext text-sm">
            {formatDate(info.getValue())}
          </p>
        );
      },
      header: () => <span>Date Submitted</span>,
    }),
  ];
  return (
    <div className="col-span-12">
      <ReusableTable
        tableData={applications?.data && Array.isArray(applications?.data) ? applications?.data : []}
        columns={columns}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
        onRowClick={handleRowClick}
      />
      <ATCDetailsDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        application={selectedApplication}
      />
    </div>
  );
};

export default ApplicationTable;
