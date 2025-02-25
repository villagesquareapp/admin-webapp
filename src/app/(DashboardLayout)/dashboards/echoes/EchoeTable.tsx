"use client";

import ReusableTable from "@/app/components/shared/ReusableTable";
import { Icon } from "@iconify/react";
import { IconDotsVertical } from "@tabler/icons-react";
import { createColumnHelper } from "@tanstack/react-table";
import { Button, Dropdown } from "flowbite-react";
import Image from "next/image";
import { formatDate } from "@/utils/dateUtils";
import { DetailComp } from "@/app/components/shared/TableSnippets";
import { FaPlus } from "react-icons/fa";
import CategoryDialog from "@/app/components/shared/CategoryDialog";
import { useState } from "react";

const EchoeTable = ({
  echoes,
  totalPages,
  currentPage,
  pageSize,
}: {
  echoes: IEchosResponse | null;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!echoes) return <div>No echoes found</div>;
  const columnHelper = createColumnHelper<IEchoes>();

  const columns = [
    columnHelper.accessor("host.profile_picture", {
      cell: (info) => (
        <div className="flex gap-3 items-center">
          <div className="relative size-12 rounded-full">
            <Image
              src={info.getValue()}
              alt="icon"
              fill
              className="rounded-full object-cover"
            />
          </div>

          <div className="truncat line-clamp-2 sm:max-w-56 flex flex-col">
            <h6 className="text-base">{info.row.original.host.name}</h6>
            <p className="text-sm text-darklink dark:text-bodytext">
              @{info.row.original.host.username}
            </p>
          </div>
        </div>
      ),
      header: () => <span>Host</span>,
    }),
    columnHelper.accessor("title", {
      cell: (info) => <DetailComp detail={info.getValue()} />,
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
    columnHelper.accessor("status", {
      cell: (info) => {
        const statusStyles = {
          live: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          ended: "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-200",
        };

        return (
          <p
            className={`rounded-full px-2 py-1 text-sm w-20 text-center capitalize ${statusStyles[info.getValue() as keyof typeof statusStyles]
              }`}
          >
            {info.getValue()}
          </p>
        );
      },
      header: () => <span>Status</span>,
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
        tableData={echoes?.data && Array.isArray(echoes?.data) ? echoes?.data : []}
        columns={columns}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
        extraButtons={
          <Button onClick={() => setIsOpen(true)} className="justify-self-end">
            <FaPlus /> Add Category
          </Button>
        }
      />
      <CategoryDialog isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
};

export default EchoeTable;
