"use client";

import ReusableTable from "@/app/components/shared/ReusableTable";
import { Icon } from "@iconify/react";
import { IconDotsVertical } from "@tabler/icons-react";
import { createColumnHelper } from "@tanstack/react-table";
import { Dropdown } from "flowbite-react";
import Image from "next/image";
import { formatDate } from "@/utils/dateUtils";
import { UserDetailsComp } from "@/app/components/shared/TableSnippets";

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
        <UserDetailsComp
          user={{
            name: info.row.original.host.name,
            username: info.row.original.host.username,
            email: info.row.original.host.email,
            last_online: info.row.original.host.last_online,
            profile_picture: info.row.original.host.profile_picture,
          }}
        />
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
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Icon icon="heroicons:user-group" className="text-gray-500" width={16} />
            <p className="text-darklink dark:text-bodytext text-sm">
              <span className="font-medium">20</span> Speakers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Icon icon="heroicons:users" className="text-gray-500" width={16} />
            <p className="text-darklink dark:text-bodytext text-sm">
              <span className="font-medium">100</span> Listeners
            </p>
          </div>
        </div>
      ),
      header: () => <span>Participants</span>,
    }),
    columnHelper.accessor("gifts", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">{info.getValue() || 0}</p>
      ),
      header: () => <span>Gifts</span>,
    }),
    columnHelper.accessor("duration", {
      cell: (info) => {
        const minutes = info.getValue() || 0;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        let formattedDuration = "";

        if (hours > 0) {
          formattedDuration += `${hours}${hours === 1 ? "hr" : "hrs"}`;
          if (remainingMinutes > 0) {
            formattedDuration += ` ${remainingMinutes}min`;
          }
        } else {
          formattedDuration = `${minutes}min`;
        }

        return <p className="text-darklink dark:text-bodytext text-sm">{formattedDuration}</p>;
      },
      header: () => <span>Duration</span>,
    }),
    columnHelper.accessor("created_at", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">
          {formatDate(info.row.original.created_at)}
        </p>
      ),
      header: () => <span>Date Created</span>,
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
