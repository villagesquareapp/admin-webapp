"use client";

import ReusableTable from "@/app/components/shared/ReusableTable";
import { formatDate } from "@/utils/dateUtils";
import { Icon } from "@iconify/react";
import { IconDotsVertical } from "@tabler/icons-react";
import { createColumnHelper } from "@tanstack/react-table";
import { Dropdown } from "flowbite-react";
import Image from "next/image";

const PendingVerifications = ({
  users,
  totalPages,
  currentPage,
  pageSize,
}: {
  users: IUsersResponse | null;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  if (!users) return <div>No users found</div>;
  const columnHelper = createColumnHelper<IUser>();

  const columns = [
    columnHelper.accessor("user_details.profile.profile_picture", {
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
            <h6 className="text-base">{info.row.original.user_details.profile.username}</h6>
          </div>
        </div>
      ),
      header: () => <span>User</span>,
    }),
    columnHelper.accessor("user_details.profile.followers", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">{info.getValue() || 0}</p>
      ),
      header: () => <span>Followers</span>,
    }),
    columnHelper.accessor("user_details.profile.created_at", {
      cell: (info) => {
        return (
          <p className="text-darklink dark:text-bodytext text-sm">
            {formatDate(info.getValue())}
          </p>
        );
      },
      header: () => <span>Created At</span>,
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
        tableData={users?.data && Array.isArray(users?.data) ? users?.data : []}
        columns={columns}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
        tableTitle="Pending Verifications"
        dropdownItems={["Action", "Another action", "Something else"]}
      />
    </div>
  );
};

export default PendingVerifications;
