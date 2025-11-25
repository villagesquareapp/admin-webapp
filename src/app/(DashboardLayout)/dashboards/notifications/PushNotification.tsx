"use client";

import { Badge, Button } from "flowbite-react";
import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import AdminAddPushNotification from "./AdminAddPushNotification";

const PushNotification = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h5 className="text-2xl flex gap-3 items-center sm:my-0 my-4">
          <Icon
            icon="solar:arrow-left-line-duotone"
            height={25}
            className="cursor-pointer"
            onClick={() => router.back()}
          />
          Notification <Badge color={"secondary"}>{5}</Badge>
        </h5>
        <div>
          {/* <TextInput
               icon={() => <Icon icon="solar:magnifer-line-duotone" height={18} />}
               type="text"
               sizing="md"
               className="form-control"
               placeholder="Search Friends"
                 onChange={(e) => setSearch(e.target.value)}
             /> */}
          <Button
            color="success"
            size="sm"
            className="w-44 lg:w-44 lg:h-10 lg:text-base"
            onClick={() => setIsOpen(true)}
          >
            Send New Notification
          </Button>
        </div>
      </div>

      <div className="col-span-12">
            {/* <TicketTable
              tickets={tickets?.data || null}
              totalPages={tickets?.data?.last_page || 1}
              currentPage={page}
              pageSize={limit}
            /> */}
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
