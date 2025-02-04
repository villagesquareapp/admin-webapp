"use client";

import ReusableTable from "@/app/components/shared/ReusableTable";
import { Icon } from "@iconify/react";
import { IconDotsVertical } from "@tabler/icons-react";
import { createColumnHelper } from "@tanstack/react-table";
import { Dropdown } from "flowbite-react";
import Image from "next/image";
import { useState } from "react";
import PendingVerificationDialog from "./PendingVerificationDialog";
import CheckBadgeIcon from "/public/images/svgs/vs-svgs/check-badge.svg";
import PremiumIcon from "/public/images/svgs/vs-svgs/premium.svg";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  if (!users) return <div>No users found</div>;
  const columnHelper = createColumnHelper<IUser>();

  const handleRowClick = (user: IUser) => {
    // setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const columns = [
    columnHelper.accessor("user_details.profile.profile_picture", {
      cell: (info) => (
        <div className="flex gap-3 items-center">
          <div className="relative size-12 rounded-full">
            {!info.row.original.user_details.profile.last_online && (
              <div className="size-3 rounded-full bg-green-500 absolute bottom-0 right-1 z-10"></div>
            )}
            <Image
              src={info.row.original.user_details.profile.profile_picture}
              alt="icon"
              fill
              className="rounded-full object-cover"
            />
          </div>

          <div className="sm:max-w-56 flex flex-col">
            <div className="flex items-center gap-1">
              <h6 className="text-base">{info.row.original.user_details.profile.name}</h6>
              {info.row.original.user_details.profile.check_mark && (
                <Image src={CheckBadgeIcon} alt="premium" width={28} height={28} />
              )}
              {info.row.original.user_details.profile.premium && (
                <Image src={PremiumIcon} alt="premium" width={18} height={18} />
              )}
            </div>
            <p className="text-sm text-darklink dark:text-bodytext">
              @{info.row.original.user_details.profile.username}
            </p>
          </div>
        </div>
      ),
      header: () => <span>Name</span>,
    }),
    columnHelper.accessor("user_details.profile.name", {
      cell: (info) => {
        return (
          <div className="text-darklink items-center flex gap-2 dark:text-bodytext text-sm">
            <Image src={PremiumIcon} alt="premium" width={18} height={18} />
            Premium
          </div>
        );
      },
      header: () => <span>Type</span>,
    }),
    columnHelper.accessor("actions", {
      cell: () => (
        <div onClick={(e) => e.stopPropagation()}>
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
              { icon: "mdi:check", listtitle: "Approve" },
              { icon: "mdi:close", listtitle: "Decline" },
            ].map((item, index) => (
              <Dropdown.Item key={index} className="flex gap-3">
                <Icon icon={item.icon} height={18} />
                <span>{item.listtitle}</span>
              </Dropdown.Item>
            ))}
          </Dropdown>
        </div>
      ),
      header: () => <span></span>,
    }),
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
        // dropdownItems={["Action", "Another action", "Something else"]}
        onRowClick={handleRowClick}
      />
      <PendingVerificationDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
    </div>
  );
};

export default PendingVerifications;
