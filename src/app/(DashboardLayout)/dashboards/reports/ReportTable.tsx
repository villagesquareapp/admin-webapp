"use client";

import LoadingComponent from "@/app/components/shared/LoadingComponent";
import ReusableTable from "@/app/components/shared/ReusableTable";
import { UserDetailsComp } from "@/app/components/shared/TableSnippets";
import { formatDate } from "@/utils/dateUtils";
import { createColumnHelper } from "@tanstack/react-table";
import Image from "next/image";

const ReportTable = ({
  reports,
  totalPages,
  currentPage,
  pageSize,
  filterDropdowns,
}: {
  reports: IReportResponse | null;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  filterDropdowns: any;
}) => {
  if (!reports) return <LoadingComponent />;
  const columnHelper = createColumnHelper<IReport>();

  const columns = [
    columnHelper.accessor("reason", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext font-[500] text-sm">
          {info.getValue() || "--"}
        </p>
      ),
      header: () => <span>Reason</span>,
    }),
    columnHelper.accessor("report_type", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">{info.getValue() || "--"}</p>
      ),
      header: () => <span>Type</span>,
    }),
    columnHelper.accessor("report_service_type", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">{info.getValue() || "--"}</p>
      ),
      header: () => <span>Service</span>,
    }),
    columnHelper.accessor("reported_user.uuid", {
      cell: (info) => (
        <UserDetailsComp
          user={{
            name: info.row.original.reported_user.name,
            username: info.row.original.reported_user.username,
            email: info.row.original.reported_user.email,
            last_online: info.row.original.reported_user.last_online,
            profile_picture: info.row.original.reported_user.profile_picture,
          }}
        />
      ),
      header: () => <span>Reported User</span>,
    }),
    columnHelper.accessor("reporter.uuid", {
      cell: (info) => (
        <div className="flex gap-3 items-center">
          <div className="relative size-12 rounded-full">
            <Image
              src={info.row.original.reporter.profile_picture}
              alt="icon"
              fill
              className="rounded-full object-cover"
            />
          </div>

          <div className="truncat line-clamp-2 sm:max-w-56 flex flex-col">
            <p className="font-medium">{info.row.original.reporter.name}</p>
            <p className="text-sm text-darklink dark:text-bodytext">
              @{info.row.original.reporter.username}
            </p>
          </div>
        </div>
      ),
      header: () => <span>Reporter</span>,
    }),
    columnHelper.accessor("created_at", {
      cell: (info) => {
        return (
          <p className="text-darklink dark:text-bodytext text-sm">
            {formatDate(info.getValue())}
          </p>
        );
      },
      header: () => <span>Date Reported</span>,
    }),
    // columnHelper.accessor("actions", {
    //   cell: () => (
    //     <Dropdown
    //       label=""
    //       dismissOnClick={false}
    //       renderTrigger={() => (
    //         <span className="h-9 w-9 flex justify-center items-center rounded-full hover:bg-lightprimary hover:text-primary cursor-pointer">
    //           <IconDotsVertical size={22} />
    //         </span>
    //       )}
    //     >
    //       {[
    //         { icon: "solar:add-circle-outline", listtitle: "Add" },
    //         { icon: "solar:pen-new-square-broken", listtitle: "Edit" },
    //         { icon: "solar:trash-bin-minimalistic-outline", listtitle: "Delete" },
    //       ].map((item, index) => (
    //         <Dropdown.Item key={index} className="flex gap-3">
    //           <Icon icon={item.icon} height={18} />
    //           <span>{item.listtitle}</span>
    //         </Dropdown.Item>
    //       ))}
    //     </Dropdown>
    //   ),
    //   header: () => <span></span>,
    // }),
  ];
  return (
    <div className="col-span-12">
      <ReusableTable
        tableData={reports?.data && Array.isArray(reports?.data) ? reports?.data : []}
        columns={columns}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
        filterDropdowns={filterDropdowns}
        tableTitle="All Reports"
      />
    </div>
  );
};

export default ReportTable;
