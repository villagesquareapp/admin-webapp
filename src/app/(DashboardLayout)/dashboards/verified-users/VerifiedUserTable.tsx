"use client";

import ReusableTable from "@/app/components/shared/ReusableTable";
import {
  DetailComp,
  UserDetailsComp,
} from "@/app/components/shared/TableSnippets";
import { formatDate } from "@/utils/dateUtils";
import { createColumnHelper } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
// import UserActions from "./UserActions";
import { getUserDetails, getUserStatus } from "@/app/api/user";
import { useEffect, useState } from "react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Button } from "flowbite-react";
import { FaPlus } from "react-icons/fa";
import AdminAddGift from "../gifts/AdminAddGift";
import AdminAddVerifiedUser from "./AdminAddVerifiedUser";
import { getVerificationRequested } from "@/app/api/pending-verification";
import { toast } from "sonner";
import VerifiedUserDetailsModal from "./VerifiedUserDetailsModal";
import PendingVerificationDialog from "../../PendingVerificationDialog";

const VerifiedUserTable = ({
  users,
  totalPages,
  currentPage,
  pageSize,
}: {
  users: IVerifiedUsersResponse | null;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  //   const handleRowClick = (user: IUser) => {
  //     console.log("Row clicked:", user);
  //     // const params = new URLSearchParams(searchParams.toString());
  //     // params.set("userId", user.user_details.profile.id);
  //     // router.replace(`?${params.toString()}`);
  //   };

  const [statuses, setStatuses] = useState<IUserStatusList[]>([]);
  const [statusLoading, setStatusLoading] = useState<boolean>(false);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [selectedPendingVerification, setSelectedPendingVerification] =
    useState<IPendingVerification | null>(null);
  const [fetchedUser, setFetchedUser] = useState<IUser | null>(null);
  const [fetchedVerification, setFetchedVerification] =
    useState<IVerificationRequested | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  const handleRowClick = async (pendingVerification: IPendingVerification) => {
    setSelectedPendingVerification(pendingVerification);
    // setIsDialogOpen(true);
    setIsFetchingDetails(true);
    setTimeout(() => {
      setIsDetailModalOpen(true);
    }, 300);

    // addParam("pending_verification", pendingVerification.uuid);

    try {
      const [userRes, verificationRes] = await Promise.all([
        getUserDetails(pendingVerification.user.uuid),
        getVerificationRequested(pendingVerification.uuid),
      ]);
      if (userRes?.data) {
        setFetchedUser(userRes.data as unknown as IUser);
      }

      if (verificationRes?.data) {
        setFetchedVerification(
          verificationRes.data as unknown as IVerificationRequested
        );
      }
    } catch (error) {
      console.error("Error fetching details:", error);
      toast.error("Failed to load full verification details");
    } finally {
      setIsFetchingDetails(false);
    }

    // router.refresh();
  };

  const handleApprove = async (id: string) => {
    console.log("Approving:", id);
    setIsDetailModalOpen(false);
  };

  const handleDecline = async (id: string) => {
    console.log("Declining:", id);
    setIsDetailModalOpen(false);
  };

  useEffect(() => {
    const fetchStatuses = async () => {
      setStatusLoading(true);
      try {
        const res = await getUserStatus();
        setStatuses(res?.data || []);
        setStatusLoading(false);
      } catch (error) {
        console.error("Failed to load user statuses:", error);
      } finally {
        setStatusLoading(false);
      }
    };
    fetchStatuses();
  }, []);

  const columnHelper = createColumnHelper<IVerifiedUsers>();

  const columns = [
    columnHelper.accessor("uuid", {
      cell: (info) => (
        <UserDetailsComp
          user={{
            name: info.row.original.name,
            username: info.row.original.username,
            email: info.row.original.email,
            last_online: info.row.original.last_online,
            profile_picture: info.row.original.profile_picture,
            premium: info.row.original.premium_verification_status,
            check_mark: info.row.original.checkmark_verification_status,
          }}
          showPremiumAndCheckMark
          showActive
        />
      ),
      header: () => <span>Name</span>,
    }),
    columnHelper.accessor("email", {
      cell: (info) => <DetailComp detail={info.getValue()} />,
      header: () => <span>Email</span>,
    }),
    columnHelper.accessor("verification_badge", {
      cell: (info) => {
        const value = info.getValue()?.toLowerCase();
        const isPremium = value === "premium";

        const baseClasses =
          "px-2 py-1 rounded text-sm font-medium capitalize inline-block";

        const premiumClasses =
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";

        const greenCheckClasses =
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";

        return (
          <span
            className={`${baseClasses} ${
              isPremium ? premiumClasses : greenCheckClasses
            }`}
          >
            {isPremium ? "Premium Verification" : "Greencheck Verification"}
          </span>
        );
      },
      header: () => <span>Verification Type</span>,
    }),
    columnHelper.accessor("status", {
      cell: (info) => {
        const status = info.getValue();
        const statusStyles = {
          active:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          suspended:
            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
          disabled:
            "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
          reported:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
          flagged:
            "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
          banned:
            "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300",
          shadow_hidden:
            "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
          archived:
            "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        };

        return (
          <span
            className={`text-sm px-3 py-1 capitalize rounded-full w-fit ${statusStyles[status]}`}
          >
            {status}
          </span>
        );
      },
      header: () => <span>Status</span>,
    }),

    columnHelper.accessor("created_at", {
      cell: (info) => {
        return (
          <p className="text-darklink dark:text-bodytext text-sm">
            {formatDate(info.getValue())}
          </p>
        );
      },
      header: () => <span>Date Joined</span>,
    }),

    columnHelper.display({
      id: "actions",
      header: () => <span>Actions</span>,
      cell: (info) => {
        const user = info.row.original;
        return (
          //   <UserActions
          //     user={user}
          //     statuses={statuses}
          //     statusLoading={statusLoading}
          //   />
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <HiOutlineDotsVertical className="text-lg" />
          </button>
        );
      },
    }),
  ];
  return (
    <>
      <div className="col-span-12 flex justify-end my-4">
        <Button
          color="success"
          size="sm"
          className="w-32 lg:w-52 lg:h-10 lg:text-base"
          onClick={() => setIsOpen(true)}
        >
          <FaPlus size={16} className="mr-2" />
          Add a verified user
        </Button>
      </div>
      <div className="col-span-12">
        <ReusableTable
          tableData={
            users?.data && Array.isArray(users?.data) ? users?.data : []
          }
          columns={columns}
          totalPages={totalPages}
          currentPage={currentPage}
          pageSize={pageSize}
          onRowClick={handleRowClick}
        />
      </div>

      {isOpen && (
        <AdminAddVerifiedUser
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}

      {isDetailModalOpen && (
        <VerifiedUserDetailsModal
          isOpen={isDetailModalOpen}
          setIsOpen={() => {
            setSelectedPendingVerification(null);
            setFetchedUser(null);
            setFetchedVerification(null);
            setIsDetailModalOpen(false);
          }}
          pendingVerification={selectedPendingVerification}
          currentSelectedUser={fetchedUser}
          currentSelectedVerificationRequested={fetchedVerification}
          // onVerificationUpdate={handleVerificationUpdate}
          isLoadingDetails={isFetchingDetails}
        />
      )}
    </>
  );
};

export default VerifiedUserTable;
