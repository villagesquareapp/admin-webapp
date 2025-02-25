"use client";

import { approvePendingVerification, declinePendingVerification } from "@/app/api/pending-verification";
import ReusableTable from "@/app/components/shared/ReusableTable";
import { formatDate } from "@/utils/dateUtils";
import { stringCleanup } from "@/utils/stringCleanup";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Icon } from "@iconify/react";
import { IconDotsVertical } from "@tabler/icons-react";
import { createColumnHelper } from "@tanstack/react-table";
import { Button, Dropdown, Label, Textarea } from "flowbite-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { UserDetailsComp } from "../components/shared/TableSnippets";
import PendingVerificationDialog from "./PendingVerificationDialog";
import useSetSearchParams from "../hooks/useSetSearchParams";

const PendingVerifications = ({
  pendingVerification,
  totalPages,
  currentPage,
  pageSize,
  currentSelectedPendingVerification,
  currentSelectedVerificationRequested,
  currentSelectedUser,
}: {
  pendingVerification: IPendingVerificationResponse | null;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  currentSelectedPendingVerification: IPendingVerification | null;
  currentSelectedVerificationRequested: IVerificationRequested | null;
  currentSelectedUser: IUser | null;
}) => {
  const { addParam, removeSpecificParam } = useSetSearchParams()
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<IPendingVerification | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [tableData, setTableData] = useState<IPendingVerification[]>(
    !!pendingVerification?.data && Array.isArray(pendingVerification?.data) ? pendingVerification?.data : []
  );

  if (!pendingVerification) return <div>No pending verifications found</div>;
  const columnHelper = createColumnHelper<IPendingVerification>();

  const handleRowClick = (pendingVerification: IPendingVerification) => {
    addParam("pending_verification", pendingVerification.verification_request?.id)
    // setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleApproveClick = (verification: IPendingVerification) => {
    setSelectedVerification(verification);
    setIsApproveDialogOpen(true);
  };

  const handleDeclineClick = (verification: IPendingVerification) => {
    setSelectedVerification(verification);
    setIsDeclineDialogOpen(true);
  };

  const handleApproveVerification = async () => {
    if (!selectedVerification) return;

    setIsApproving(true);
    try {
      const response = await approvePendingVerification(selectedVerification.verification_request.id);

      if (response.status) {
        toast.success("Verification approved successfully");
        setIsApproveDialogOpen(false);

        // Remove the approved verification from the table data
        setTableData(prevData =>
          prevData.filter(item =>
            item.verification_request.id !== selectedVerification.verification_request.id
          )
        );
      } else {
        toast.error(response.message || "Failed to approve verification");
      }
    } catch (error) {
      toast.error("An error occurred while approving verification");
      console.error(error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleDeclineVerification = async () => {
    if (!selectedVerification || !declineReason.trim()) return;

    setIsDeclining(true);
    try {
      const response = await declinePendingVerification(
        selectedVerification.verification_request.id,
        { adminComments: declineReason }
      );

      if (response.status) {
        toast.success("Verification declined successfully");
        setIsDeclineDialogOpen(false);
        setDeclineReason("");

        // Remove the declined verification from the table data
        setTableData(prevData =>
          prevData.filter(item =>
            item.verification_request.id !== selectedVerification.verification_request.id
          )
        );
      } else {
        toast.error(response.message || "Failed to decline verification");
      }
    } catch (error) {
      toast.error("An error occurred while declining verification");
      console.error(error);
    } finally {
      setIsDeclining(false);
    }
  };

  const handleVerificationUpdate = (id: string, action: 'approve' | 'decline') => {
    // Remove the verification from the table data
    setTableData(prevData =>
      prevData.filter(item =>
        item.verification_request.id !== id
      )
    );
  };

  const columns = [
    columnHelper.accessor("user.profile_picture", {
      cell: (info) => (
        <UserDetailsComp
          user={{
            name: info.row.original.user.name,
            username: info.row.original.user.username,
            email: info.row.original.user.email,
            profile_picture: info.row.original.user.profile_picture,
          }}
        />
      ),
      header: () => <span>Name</span>,
    }),
    columnHelper.accessor("verification_request.type", {
      cell: (info) => {
        const type = info.row.original.verification_request.type;
        let bgColorClass = "";

        // Set background and text color based on verification type
        if (type === "account_verification") {
          bgColorClass = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
        } else if (type === "premium_verification") {
          bgColorClass = "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
        } else if (type === "withdrawal_verification") {
          bgColorClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
        }

        return (
          <>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${bgColorClass}`}>
                {stringCleanup(type).charAt(0).toUpperCase() + stringCleanup(type).slice(1)}
              </span>
            </div>
          </>
        );
      },
      header: () => <span>Types</span>,
    }),

    columnHelper.accessor("user.date_joined", {
      cell: (info) => {
        return (
          <p className="text-darklink dark:text-bodytext text-sm">
            {formatDate(info.getValue())}
          </p>
        );
      },
      header: () => <span>Date Joined</span>,
    }),
    columnHelper.accessor("actions", {
      cell: (info) => (
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
              {
                icon: "mdi:check",
                listtitle: "Approve",
                onClick: () => handleApproveClick(info.row.original)
              },
              {
                icon: "mdi:close",
                listtitle: "Decline",
                onClick: () => handleDeclineClick(info.row.original)
              },
            ].map((item, index) => (
              <Dropdown.Item
                key={index + item.listtitle}
                className="flex gap-3"
                onClick={item.onClick}
              >
                <Icon icon={item.icon} height={20} />
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
        tableData={tableData}
        columns={columns}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
        tableTitle="Pending Verifications"
        onRowClick={handleRowClick}
      />
      <PendingVerificationDialog
        isOpen={isDialogOpen}
        setIsOpen={() => {
          removeSpecificParam(["pending_verifications"])
          setIsDialogOpen(false)
        }}
        currentSelectedUser={currentSelectedUser}
        currentSelectedVerificationRequested={currentSelectedVerificationRequested}
        onVerificationUpdate={handleVerificationUpdate}
      />

      {/* Approve Dialog */}
      <Dialog
        open={isApproveDialogOpen}
        onClose={() => setIsApproveDialogOpen(false)}
        className="relative z-50"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30"
        />
        <div className="fixed inset-0 mx-auto flex items-center justify-center p-4">
          <DialogPanel
            as={motion.div}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-[500px] flex flex-col p-6 gap-6 rounded-lg bg-white dark:bg-darkgray shadow-md"
          >
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-semibold">Approve Verification</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Are you sure you want to approve the {" "}
                <span className="font-medium">
                  {selectedVerification?.verification_request.type &&
                    stringCleanup(selectedVerification.verification_request.type)}
                </span>{" "}
                request for <span className="font-medium">{selectedVerification?.user.name}</span>?
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setIsApproveDialogOpen(false)}
                color="gray"
                className="w-fit"
                disabled={isApproving}
              >
                Cancel
              </Button>
              <Button
                color="success"
                className="w-fit min-w-[100px]"
                onClick={handleApproveVerification}
                disabled={isApproving}
              >
                {isApproving ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Approving...
                  </div>
                ) : (
                  "Approve"
                )}
              </Button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Decline Dialog */}
      <Dialog
        open={isDeclineDialogOpen}
        onClose={() => setIsDeclineDialogOpen(false)}
        className="relative z-50"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30"
        />
        <div className="fixed inset-0 mx-auto flex items-center justify-center p-4">
          <DialogPanel
            as={motion.div}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-[500px] flex flex-col p-6 gap-6 rounded-lg bg-white dark:bg-darkgray shadow-md"
          >
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-semibold">Decline Verification</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Are you sure you want to decline the {" "}
                <span className="font-medium">
                  {selectedVerification?.verification_request.type &&
                    stringCleanup(selectedVerification.verification_request.type)}
                </span>{" "}
                request for <span className="font-medium">{selectedVerification?.user.name}</span>?
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                rows={4}
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                id="reason"
                className="w-full form-control-textarea"
                placeholder="Enter reason for declining..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                onClick={() => {
                  setIsDeclineDialogOpen(false);
                  setDeclineReason("");
                }}
                color="gray"
                className="w-fit"
                disabled={isDeclining}
              >
                Cancel
              </Button>
              <Button
                color="failure"
                className="w-fit min-w-[100px]"
                onClick={handleDeclineVerification}
                disabled={isDeclining || !declineReason.trim()}
              >
                {isDeclining ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Declining...
                  </div>
                ) : (
                  "Decline"
                )}
              </Button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
};

export default PendingVerifications;
