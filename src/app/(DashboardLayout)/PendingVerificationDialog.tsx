"use client";

import { Button, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { formatDate } from "@/utils/dateUtils";
import { stringCleanup } from "@/utils/stringCleanup";
import {
  Badge,
  Button as FlowbiteButton,
  Label,
  Spinner,
  Textarea,
} from "flowbite-react";
import { useEffect, useState } from "react";
import {
  approvePendingVerification,
  declinePendingVerification,
} from "@/app/api/pending-verification";
import { toast } from "sonner";

const PendingVerificationDialog = ({
  isOpen,
  setIsOpen,
  currentSelectedUser,
  currentSelectedVerificationRequested,
  pendingVerification,
  onVerificationUpdate,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentSelectedUser?: IUser | null;
  currentSelectedVerificationRequested?: IVerificationRequested | null;
  pendingVerification?: IPendingVerification | null;
  onVerificationUpdate?: (id: string, action: "approve" | "decline") => void;
}) => {
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Set loading state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Set a short timeout to simulate loading and handle the case where data is available immediately
      const timer = setTimeout(() => {
        if (
          pendingVerification?.user &&
          pendingVerification?.subscription.plan.name
        ) {
          setIsLoading(false);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen, pendingVerification?.user, pendingVerification]);

  // Update loading state when data becomes available
  useEffect(() => {
    if (pendingVerification?.user && pendingVerification) {
      setIsLoading(false);
    }
  }, [pendingVerification?.user, pendingVerification]);

  const handleApproveVerification = async () => {
    if (!pendingVerification?.subscription.plan.name) return;

    setIsApproving(true);
    try {
      const response = await approvePendingVerification(
        pendingVerification?.uuid
      );

      if (response.status) {
        toast.success("Verification approved successfully");
        setIsApproveDialogOpen(false);

        if (onVerificationUpdate) {
          onVerificationUpdate(pendingVerification?.uuid, "approve");
        }

        setIsOpen(false);
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
    if (!pendingVerification || !declineReason.trim()) return;

    setIsDeclining(true);
    try {
      const response = await declinePendingVerification(
        pendingVerification?.uuid,
        { adminComments: declineReason }
      );

      if (response.status) {
        toast.success("Verification declined successfully");
        setIsDeclineDialogOpen(false);
        setDeclineReason("");

        if (onVerificationUpdate) {
          onVerificationUpdate(pendingVerification?.uuid, "decline");
        }

        setIsOpen(false);
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

  // Get verification type display name
  const getVerificationType = (type: string) => {
    return (
      stringCleanup(type).charAt(0).toUpperCase() + stringCleanup(type).slice(1)
    );
  };

  // Get badge color based on verification type
  const getVerificationBadgeColor = (type: string) => {
    if (type === "account_verification") {
      return "info";
    } else if (type === "premium_verification") {
      return "purple";
    } else if (type === "withdrawal_verification") {
      return "success";
    }
    return "gray";
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "failure";
      default:
        return "gray";
    }
  };

  // Get document status badge color
  const getDocumentStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "failure";
      default:
        return "gray";
    }
  };
  const hasFullData = currentSelectedUser && currentSelectedVerificationRequested;

  if (!pendingVerification?.user || !pendingVerification) {
    return (
      <AnimatePresence mode="wait" key="empty-dialog">
        {isOpen && (
          <Dialog
            static
            open={isOpen}
            onClose={() => {
              setIsOpen(false);
            }}
            className="relative z-50"
          >
            <div className="sticky top-0 bg-background border-b dark:border-gray-600 z-50 m-0 h-16 p-0">
              <div className="flex items-center justify-between px-6 py-3">
                <DialogTitle className="text-center flex-1 m-0">
                  Pending Verification
                </DialogTitle>
                <Button
                  onClick={() => setIsOpen(false)}
                  className="p-1 px-2.5 rounded-full transition-colors"
                >
                  <Icon icon="solar:close-circle-bold" height={30} />
                </Button>
              </div>
            </div>

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
                className="w-full max-w-[1100px] flex flex-col h-[95dvh] max-h-[850px] overflow-hidden p-0 gap-0 rounded-lg bg-white dark:bg-darkgray shadow-md dark:dark-shadow-md"
              >
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 dark:text-gray-400">
                    No verification data available.
                  </p>
                </div>
              </DialogPanel>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait" key="verification-dialog">
        {isOpen && (
          <Dialog
            static
            open={isOpen}
            onClose={() => {
              setIsOpen(false);
            }}
            className="relative z-50"
          >
            <div className="sticky top-0 bg-background border-b dark:border-gray-600 z-50 m-0 h-16 p-0">
              <div className="flex items-center justify-between px-6 py-3">
                <DialogTitle className="text-center flex-1 m-0 text-xl font-bold">
                  Pending Verification
                </DialogTitle>
                <Button
                  onClick={() => setIsOpen(false)}
                  className="p-1 px-2.5 rounded-full transition-colors"
                >
                  <Icon icon="solar:close-circle-bold" height={30} />
                </Button>
              </div>
            </div>

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
                className="w-full max-w-[1100px] flex flex-col h-[95dvh] max-h-[850px] overflow-hidden p-0 gap-0 rounded-lg bg-white dark:bg-darkgray shadow-md dark:dark-shadow-md"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Spinner size="xl" className="mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        Loading verification details...
                      </p>
                    </div>
                  </div>
                ) : !pendingVerification.user || !pendingVerification ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 dark:text-gray-400">
                      No verification data available
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="p-5 overflow-y-auto flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
                        {/* User Profile Section */}
                        <div className="md:col-span-1 border dark:border-gray-700 p-5 rounded-lg shadow-sm">
                          <div className="flex flex-col items-center">
                            <div className="relative w-36 h-36 mb-5">
                              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg">
                                <Image
                                  src={
                                    currentSelectedUser?.user_details?.profile
                                      ?.profile_picture ||
                                    pendingVerification?.user
                                      ?.profile_picture ||
                                    "/images/profile/user-1.jpg"
                                  }
                                  alt={pendingVerification?.user?.name}
                                  className="object-cover w-full h-full"
                                  width={144}
                                  height={144}
                                />
                              </div>
                            </div>
                            <h2 className="text-xl font-bold mb-1">
                              {currentSelectedUser?.user_details?.profile?.name || pendingVerification?.user?.name}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-2">
                              @{currentSelectedUser?.user_details?.profile?.username || pendingVerification?.user?.username}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 mb-3">
                              {currentSelectedUser?.user_details?.profile?.email || pendingVerification?.user?.email}
                            </p>

                            <div className="w-full mt-4 space-y-3">
                              <div className="flex justify-between border-b dark:border-gray-700 pb-2">
                                <span className="text-gray-500 dark:text-gray-400">
                                  Followers
                                </span>
                                <span className="font-medium text-gray-500">
                                  {
                                    currentSelectedVerificationRequested?.social_metrics.followers_count
                                  }
                                </span>
                              </div>
                              <div className="flex justify-between border-b dark:border-gray-700 pb-2">
                                <span className="text-gray-500 dark:text-gray-400">
                                  Following
                                </span>
                                <span className="font-medium text-gray-500">
                                  {
                                    currentSelectedVerificationRequested?.social_metrics.following_count
                                  }
                                </span>
                              </div>
                              <div className="flex justify-between border-b dark:border-gray-700 pb-2">
                                <span className="text-gray-500 dark:text-gray-400">
                                  Posts
                                </span>
                                <span className="font-medium text-gray-500">
                                  {
                                    currentSelectedUser?.user_details?.profile
                                      ?.posts_count
                                  }
                                </span>
                              </div>
                              <div className="flex justify-between border-b dark:border-gray-700 pb-2">
                                <span className="text-gray-500 dark:text-gray-400">
                                  Joined
                                </span>
                                <span className="font-medium text-gray-500">
                                  {formatDate(
                                    currentSelectedVerificationRequested?.social_metrics.duration_since_joining ?? ""
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">
                                  Account Type
                                </span>
                                <span className="font-medium text-gray-500">
                                  {
                                    currentSelectedUser?.user_details?.profile
                                      ?.account_type
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Verification Details Section */}
                        <div className="md:col-span-2">
                          <div className="border dark:border-gray-700 p-5 rounded-lg mb-5 shadow-sm">
                            <h3 className="text-lg font-semibold mb-4 border-b dark:border-gray-700 pb-2">
                              Verification Request Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              <div>
                                <p className="text-gray-500 dark:text-gray-400  mb-1">
                                  Request Type
                                </p>
                                <Badge
                                  color={getVerificationBadgeColor(
                                    pendingVerification?.subscription.plan.name
                                  )}
                                  size="md"
                                  className="px-3 py-1"
                                >
                                  {getVerificationType(
                                    pendingVerification?.subscription.plan.name
                                  )}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400  mb-1">
                                  Status
                                </p>
                                <Badge
                                  color={getStatusBadgeColor(
                                    currentSelectedVerificationRequested?.status ?? ""
                                  )}
                                  size="md"
                                  className="px-3 py-1"
                                >
                                  {stringCleanup(
                                    currentSelectedVerificationRequested?.status.toUpperCase() ?? "N/A"
                                  )}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400  mb-1">
                                  Current Stage
                                </p>
                                <p className="font-medium">
                                  {
                                    currentSelectedVerificationRequested?.current_stage
                                  }
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400  mb-1">
                                  Created At
                                </p>
                                <p className="font-medium">
                                  {formatDate(
                                    pendingVerification.created_at ??
                                      ""
                                  )}
                                </p>
                              </div>
                              {/* <div>
                                <p className="text-gray-500 dark:text-gray-400  mb-1">Location</p>
                                <p className="font-medium">{currentSelectedVerificationRequested?.location || "N/A"}</p>
                              </div> */}
                            </div>

                            {/* Social Metrics */}
                            <div className="mb-6">
                              <h4 className="text-base font-semibold mb-3 border-b dark:border-gray-700 pb-2">
                                Social Metrics
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border dark:border-gray-700 p-4 rounded-lg">
                                <div>
                                  <p className="text-gray-500 dark:text-gray-400  mb-1">
                                    Followers Count
                                  </p>
                                  <p className="font-medium">
                                    {
                                      currentSelectedVerificationRequested
                                        ?.social_metrics?.followers_count
                                    }
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 dark:text-gray-400  mb-1">
                                    Following Count
                                  </p>
                                  <p className="font-medium">
                                    {
                                      currentSelectedVerificationRequested
                                        ?.social_metrics?.following_count
                                    }
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 dark:text-gray-400  mb-1">
                                    Date Joined
                                  </p>
                                  <p className="font-medium">
                                    {formatDate(
                                      currentSelectedVerificationRequested
                                        ?.social_metrics?.date_joined ?? ""
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 dark:text-gray-400  mb-1">
                                    Account Age
                                  </p>
                                  <p className="font-medium">
                                    {
                                      currentSelectedVerificationRequested
                                        ?.social_metrics?.duration_since_joining
                                    }
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* IF no document we render this */}
                            {currentSelectedVerificationRequested?.documents &&
                              currentSelectedVerificationRequested?.documents
                                .length === 0 && (
                                <div className="mb-6">
                                  <h4 className="text-base font-semibold mb-3 border-b dark:border-gray-700 pb-2">
                                    Submitted Documents
                                  </h4>
                                  <p className="text-gray-500 dark:text-gray-400">
                                    N/A
                                  </p>
                                </div>
                              )}
                            {/* Documents Section */}
                            {currentSelectedVerificationRequested?.documents &&
                              currentSelectedVerificationRequested?.documents
                                .length > 0 && (
                                <div className="mb-6">
                                  <h4 className="text-base font-semibold mb-3 border-b dark:border-gray-700 pb-2">
                                    Submitted Documents
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {currentSelectedVerificationRequested?.documents?.map(
                                      (
                                        doc: IVerificationDocument,
                                        index: number
                                      ) => (
                                        <div
                                          key={`doc-${doc?.uuid || index}`}
                                          className="border dark:border-gray-700 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                          <div className="flex items-center gap-2 mb-2">
                                            <Icon
                                              icon="mdi:file-document-outline"
                                              className="text-blue-500"
                                              height={20}
                                            />
                                            <span className=" font-medium truncate">
                                              {doc?.document_type ||
                                                `Document ${index + 1}`}
                                            </span>
                                          </div>
                                          <div className="flex justify-between items-center mb-2">
                                            <Badge
                                              color={getDocumentStatusBadgeColor(
                                                doc?.status
                                              )}
                                              size="xs"
                                              className="px-2 py-0.5"
                                            >
                                              {stringCleanup(doc?.status)}
                                            </Badge>
                                            <span className="text-xs text-gray-500">
                                              {formatDate(doc?.created_at)}
                                            </span>
                                          </div>
                                          {doc?.document_url && (
                                            <a
                                              href={doc?.document_url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1"
                                            >
                                              <Icon
                                                icon="mdi:eye"
                                                height={16}
                                              />
                                              View Document
                                            </a>
                                          )}
                                          {doc?.rejection_reason && (
                                            <div className="mt-2 text-xs text-red-500">
                                              <p className="font-medium">
                                                Rejection reason:
                                              </p>
                                              <p>{doc?.rejection_reason}</p>
                                            </div>
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* User Bio Section */}
                            {currentSelectedUser?.user_details?.profile
                              ?.bio && (
                              <div className="border dark:border-gray-700 p-4 rounded-lg shadow-sm">
                                <h3 className="text-base font-semibold mb-3 border-b dark:border-gray-700 pb-2">
                                  Bio
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                  {
                                    currentSelectedUser?.user_details?.profile
                                      ?.bio
                                  }
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer with Action Buttons */}
                    <div className="border-t dark:border-gray-600 p-4 flex justify-between gap-3">
                      <FlowbiteButton
                        color="gray"
                        onClick={() => setIsOpen(false)}
                        className="px-6"
                      >
                        Close
                      </FlowbiteButton>
                      <div className="flex gap-3">
                        <FlowbiteButton
                          color="failure"
                          onClick={() => setIsDeclineDialogOpen(true)}
                        >
                          <Icon icon="mdi:close" className="mr-2" height={20} />
                          Decline
                        </FlowbiteButton>
                        <FlowbiteButton
                          color="success"
                          onClick={() => setIsApproveDialogOpen(true)}
                        >
                          <Icon icon="mdi:check" className="mr-2" height={20} />
                          Approve
                        </FlowbiteButton>
                      </div>
                    </div>
                  </>
                )}
              </DialogPanel>
            </div>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Approve Dialog */}
      <AnimatePresence mode="wait" key="approve-dialog">
        {isApproveDialogOpen && (
          <Dialog
            static
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
                  <h3 className="text-xl font-semibold">
                    Approve Verification
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Are you sure you want to approve the{" "}
                    <span className="font-medium">
                      {currentSelectedVerificationRequested?.subscription.plan.name &&
                        stringCleanup(
                          currentSelectedVerificationRequested?.subscription.plan.name
                        )}
                    </span>{" "}
                    request for{" "}
                    <span className="font-medium">
                      {currentSelectedUser?.user_details?.profile?.name || pendingVerification?.user?.name}
                    </span>
                    ?
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <FlowbiteButton
                    onClick={() => setIsApproveDialogOpen(false)}
                    color="gray"
                    className="w-fit"
                    disabled={isApproving}
                  >
                    Cancel
                  </FlowbiteButton>
                  <FlowbiteButton
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
                  </FlowbiteButton>
                </div>
              </DialogPanel>
            </div>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Decline Dialog */}
      <AnimatePresence mode="wait" key="decline-dialog">
        {isDeclineDialogOpen && (
          <Dialog
            static
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
                  <h3 className="text-xl font-semibold">
                    Decline Verification
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Are you sure you want to decline the{" "}
                    <span className="font-medium">
                      {pendingVerification?.subscription.plan
                        .name &&
                        stringCleanup(
                          pendingVerification?.subscription.plan.name
                        )}
                    </span>{" "}
                    request for{" "}
                    <span className="font-medium">
                      {pendingVerification?.user?.name}
                    </span>
                    ?
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
                  <FlowbiteButton
                    onClick={() => {
                      setIsDeclineDialogOpen(false);
                      setDeclineReason("");
                    }}
                    color="gray"
                    className="w-fit"
                    disabled={isDeclining}
                  >
                    Cancel
                  </FlowbiteButton>
                  <FlowbiteButton
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
                  </FlowbiteButton>
                </div>
              </DialogPanel>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};

export default PendingVerificationDialog;
