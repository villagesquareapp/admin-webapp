"use client";

import ReusableTable from "@/app/components/shared/ReusableTable";
import { Icon } from "@iconify/react";
import { IconDotsVertical } from "@tabler/icons-react";
import { createColumnHelper } from "@tanstack/react-table";
import { Dropdown } from "flowbite-react";

const TicketTable = ({
  tickets,
  totalPages,
  currentPage,
  pageSize,
}: {
  tickets: ITicketResponse | null;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  if (!tickets) return <div>No tickets found</div>;
  const columnHelper = createColumnHelper<ITicket>();

  const columns = [
    columnHelper.accessor("title", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">{info.getValue() || "--"}</p>
      ),
      header: () => <span>Title</span>,
    }),
    columnHelper.accessor("description", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">{info.getValue() || "--"}</p>
      ),
      header: () => <span>Description</span>,
    }),
    columnHelper.accessor("status", {
      cell: (info) => {
        const status = info.getValue();
        let statusColor = "";
        let bgColor = "";

        switch (status) {
          case "open":
            statusColor = "text-blue-600 dark:text-blue-400";
            bgColor = "bg-blue-100/60 dark:bg-blue-900/30";
            break;
          case "in_progress":
            statusColor = "text-yellow-600 dark:text-yellow-400";
            bgColor = "bg-yellow-100/60 dark:bg-yellow-900/30";
            break;
          case "resolved":
            statusColor = "text-green-600 dark:text-green-400";
            bgColor = "bg-green-100/60 dark:bg-green-900/30";
            break;
          case "closed":
            statusColor = "text-gray-600 dark:text-gray-400";
            bgColor = "bg-gray-100/60 dark:bg-gray-900/30";
            break;
          default:
            statusColor = "text-gray-600 dark:text-gray-400";
            bgColor = "bg-gray-100/60 dark:bg-gray-900/30";
        }

        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor} ${bgColor} capitalize`}
          >
            {status || "--"}
          </span>
        );
      },
      header: () => <span>Status</span>,
    }),
    columnHelper.accessor("actions", {
      cell: () => (
        <Dropdown
          label=""
          dismissOnClick={false}
          renderTrigger={() => (
            <span className="h-9 w-9 flex justify-center items-center rounded-full hover:bg-lightprimary hover:text-primary cursor-pointer">
              <IconDotsVertical size={22} />
            </span>
          )}
        >
          {[
            { icon: "solar:add-circle-outline", listtitle: "Add" },
            { icon: "solar:pen-new-square-broken", listtitle: "Edit" },
            { icon: "solar:trash-bin-minimalistic-outline", listtitle: "Delete" },
          ].map((item, index) => (
            <Dropdown.Item key={index} className="flex gap-3">
              <Icon icon={item.icon} height={18} />
              <span>{item.listtitle}</span>
            </Dropdown.Item>
          ))}
        </Dropdown>
      ),
      header: () => <span></span>,
    }),
  ];
  return (
    <div className="col-span-12">
      <ReusableTable
        tableData={tickets?.data && Array.isArray(tickets?.data) ? tickets?.data : []}
        columns={columns}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
      />
    </div>
  );
};

export default TicketTable;
