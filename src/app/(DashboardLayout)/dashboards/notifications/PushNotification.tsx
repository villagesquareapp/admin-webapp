"use client";

import { Badge, Button } from "flowbite-react";
import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import AdminAddPushNotification from "./AdminAddPushNotification";
import ReusableTable from "@/app/components/shared/ReusableTable";
import { createColumnHelper } from "@tanstack/react-table";
import Image from "next/image";
import { formatDate } from "@/utils/dateUtils";
import { DetailComp } from "@/app/components/shared/TableSnippets";

const PushNotification = ({
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
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);

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
        header: () => <span>Title</span>,
      }),
      columnHelper.accessor("category.name", {
        cell: (info) => (
          <p className="text-darklink dark:text-bodytext text-sm">{info.getValue() || 0}</p>
        ),
        header: () => <span>Body</span>,
      }),
      columnHelper.accessor("users", {
        cell: (info) => (
          <p className="text-darklink dark:text-bodytext text-sm">{info.getValue() || 0}</p>
        ),
        header: () => <span>Category Type</span>,
      }),
      columnHelper.accessor("gifts", {
        cell: (info) => (
          <p className="text-darklink dark:text-bodytext text-sm">{info.getValue() || 0}</p>
        ),
        header: () => <span>No Of Users</span>,
      }),
      columnHelper.accessor("created_at", {
        cell: (info) => (
          <p className="text-darklink dark:text-bodytext text-sm">
            {formatDate(info.row.original.created_at)}
          </p>
        ),
        header: () => <span>Date Created</span>,
      }),
    ];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h5 className="text-2xl flex gap-3 items-center sm:my-0">
          <Icon
            icon="solar:arrow-left-line-duotone"
            height={25}
            className="cursor-pointer"
            onClick={() => router.back()}
          />
          Notifications <Badge color={"secondary"}>{echoes?.data.length}</Badge>
        </h5>
        <div>
          
          <Button
            color="success"
            size="sm"
            className="w-44 lg:w-52 lg:h-10 lg:text-base"
            onClick={() => setIsOpen(true)}
          >
            Send New Notification
          </Button>
        </div>
      </div>

      {/* Table */}

      <div className="col-span-12">
        <ReusableTable
          tableData={
            echoes?.data && Array.isArray(echoes?.data) ? echoes?.data : []
          }
          columns={columns}
          totalPages={totalPages}
          currentPage={currentPage}
          pageSize={pageSize}
        />
      </div>

      {isOpen && (
        <AdminAddPushNotification
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default PushNotification;
