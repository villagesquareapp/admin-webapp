"use client";

import ReusableTable from "@/app/components/shared/ReusableTable";
import { Icon } from "@iconify/react";
import { IconDotsVertical } from "@tabler/icons-react";
import { createColumnHelper } from "@tanstack/react-table";
import { Dropdown } from "flowbite-react";
import Image from "next/image";
import { formatDate } from "@/utils/dateUtils";

const LivestreamTable = ({
  livestreams,
  totalPages,
  currentPage,
  pageSize,
}: {
  livestreams: ILivestreamResponse | null;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  if (!livestreams) return <div>No livestreams found</div>;
  const columnHelper = createColumnHelper<ILivestreams>();

  const columns = [
    columnHelper.accessor("host.profile_picture", {
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
            <h6 className="text-base">{info.row.original.host.username}</h6>
          </div>
        </div>
      ),
      header: () => <span>Host</span>,
    }),
    columnHelper.accessor("title", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">{info.getValue() || "-"}</p>
      ),
      header: () => <span>Title</span>,
    }),
    columnHelper.accessor("category.name", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">{info.getValue() || 0}</p>
      ),
      header: () => <span>Category</span>,
    }),
    columnHelper.accessor("users", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">{info.getValue() || 0}</p>
      ),
      header: () => <span>Streamers</span>,
    }),
    columnHelper.accessor("gifts", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">{info.getValue() || 0}</p>
      ),
      header: () => <span>Gifts</span>,
    }),
    columnHelper.accessor("duration", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">{info.getValue() || 0}</p>
      ),
      header: () => <span>Duration</span>,
    }),
    columnHelper.accessor("created_at", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">
          {formatDate(info.row.original.created_at)}
        </p>
      ),
      header: () => <span>Created At</span>,
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
        tableData={
          livestreams?.data && Array.isArray(livestreams?.data) ? livestreams?.data : []
        }
        columns={columns}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
      />
    </div>
  );
};

export default LivestreamTable;
