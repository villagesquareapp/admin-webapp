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
import Actions from "./Actions";
import { deletePushNotification, resendPushNotification } from "@/app/api/push-notification";

const PushNotification = ({
  notifications,
  totalPages,
  currentPage,
  pageSize,
}: {
  notifications: IPushNotificationResponse | null;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const columnHelper = createColumnHelper<IPushNotifications>();

  const columns = [
    columnHelper.accessor("title", {
      cell: (info) => (
        <div className="flex gap-3 items-center">
          <div className="truncat line-clamp-2 sm:max-w-56 flex flex-col">
            <h6 className="text-base">{info.row.original.title.length > 60 ? info.row.original.title.substring(0, 60) + "..." : info.row.original.title}</h6>
          </div>
        </div>
      ),
      header: () => <span>Title</span>,
    }),
    columnHelper.accessor("body", {
      
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">
          {info.row.original.body.length > 50
            ? info.row.original.body.substring(0, 50) + "..."
            : info.row.original.body}
        </p>
      ),
      header: () => <span>Body</span>,
    }),
    columnHelper.accessor("category", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">
          {info.row.original.category}
        </p>
      ),
      header: () => <span>Category Type</span>,
    }),
    columnHelper.accessor("uuid", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">All users</p>
      ),
      header: () => <span>Targeted Users</span>,
    }),
    columnHelper.accessor("created_at", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">
          {formatDate(info.row.original.created_at)}
        </p>
      ),
      header: () => <span>Date Created</span>,
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span>Actions</span>,
      cell: (info) => {
        const notification = info.row.original;
        return (
          <Actions
            notification={notification}
            onResend={resendPushNotification}
            onDelete={deletePushNotification}
          />
        );
      },
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
          Notifications{" "}
          {/* <Badge color={"secondary"}>{notifications?.data.length}</Badge> */}
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
            notifications?.data && Array.isArray(notifications?.data)
              ? notifications?.data
              : []
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
