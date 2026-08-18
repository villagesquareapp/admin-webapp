"use client";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Button } from "flowbite-react";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { formatDate } from "@/utils/dateUtils";
import { UserDetailsComp } from "@/app/components/shared/TableSnippets";
import { IoMdCheckmark } from "react-icons/io";
import { LiaTimesSolid } from "react-icons/lia";
import { useEffect, useState } from "react";
import { approveATCApplication, declineATCApplication, reviewATCApplication } from "@/app/api/atc";

const ATCDetailsDialog = ({
  isOpen,
  onClose,
  application,
  onStatusChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  application: IATCApplication | null;
  onStatusChange?: () => void;
}) => {
  if (!application) return null;

  const [isMetricsPanelOpen, setIsMetricsPanelOpen] = useState(application.status === "approved");
  const [currentStatus, setCurrentStatus] = useState(application.status);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    setCurrentStatus(application.status);
    setIsMetricsPanelOpen(application.status === "approved");
  }, [application.uuid, application.status]);

  useEffect(() => {
    const markAsInReview = async () => {
      if (isOpen && application.status === "pending" && currentStatus === "pending") {
        try {
          const res = await reviewATCApplication(application.uuid);
          console.log(res);
          if (res.status) {
            setCurrentStatus("in_review");
            // Optionally: revalidate path or trigger parent refresh
          }
        } catch (error) {
          console.error("Failed to move application to review:", error);
        }
      }
    };

    markAsInReview();
  }, [isOpen, application.uuid, application.status, currentStatus]);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      const res = await approveATCApplication(application.uuid);
      if (res.status) {
        setCurrentStatus("approved");
        onStatusChange?.();
      }
    } catch (error) {
      console.error("Failed to approve application:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    setIsProcessing(true);
    try {
      const res = await declineATCApplication(application.uuid);
      if (res.status) {
        setCurrentStatus("declined");
        onStatusChange?.();
      }
    } catch (error) {
      console.error("Failed to decline application:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          static
          open={isOpen}
          onClose={onClose}
          className="relative z-50"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50"
          />
          <div className="fixed inset-0 mx-auto flex items-center justify-center p-4">
            <DialogPanel
              as={motion.div}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[800px] flex flex-col max-h-[85vh] overflow-hidden p-0 gap-0 rounded-xl bg-white dark:bg-darkgray shadow-2xl dark:shadow-black/50"
            >
              <AnimatePresence mode="wait" initial={false}>
                {!isMetricsPanelOpen ? (
                  <motion.div
                    key="details"
                    initial={{ x: application.status === "approved" ? "100%" : -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: application.status === "approved" ? "100%" : -100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="flex flex-col h-full overflow-hidden"
                  >
                    <div className="sticky top-0 bg-white dark:bg-darkgray border-b dark:border-gray-700 z-50">
                      <div className="flex items-center justify-between px-6 py-4">
                        <DialogTitle className="text-xl font-bold">
                          ATC Details
                        </DialogTitle>
                        <Button onClick={onClose} className="p-1">
                          <Icon icon="solar:close-circle-bold" height={14} />
                        </Button>
                      </div>
                    </div>

                    <div className="overflow-y-auto p-6 space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 border-2 border-gray-100 dark:border-gray-700">
                          <Image
                            src={
                              application.user.profile_picture ||
                              "/images/placeholder.png"
                            }
                            alt={application.fullname}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h3 className="text-xl font-bold flex items-center gap-2">
                            {application.fullname}
                            {/* Verification badges not explicitly in IATCApplication, defaulting to hidden or checking user prop if enriched */}
                          </h3>
                          <div className="flex gap-2 mt-2">
                            <span
                              className={`px-3 py-1 text-xs rounded-full font-medium capitalize
                        ${currentStatus === "approved"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : currentStatus === "declined"
                                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                    : currentStatus === "in_review" || currentStatus === "in-review"
                                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                }`}
                            >
                              {currentStatus?.replace(" ", "_")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Profession
                          </p>
                          <p className="font-medium">
                            {application.occupation || "N/A"}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Application Type
                          </p>
                          <p className="font-medium">
                            {application.application_type || "N/A"}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Duration
                          </p>
                          <p className="font-medium break-all">
                            {application.occupation_duration || "N/A"}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Date Joined
                          </p>
                          <p className="font-medium">
                            {formatDate(application.created_at)}
                          </p>
                        </div>
                      </div>

                      {application.about && (
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Bio
                          </p>
                          <p className="text-sm leading-relaxed">
                            {application.about}
                          </p>
                        </div>
                      )}

                      {(currentStatus === "pending" || currentStatus === "in_review" || currentStatus === "in-review") && (
                        <div className="space-y-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Identification & Profile Picture
                          </p>
                          <div className="grid grid-cols-3 gap-4">
                            {[
                              { label: "ID Front", url: application.id_card_front_url },
                              { label: "ID Back", url: application.id_card_back_url },
                              { label: "Profile Picture", url: application.profile_picture_url },
                            ].map((img, idx) => (
                              <div key={idx} className="space-y-2">
                                <p className="text-xs text-center text-gray-500 dark:text-gray-400 font-medium">
                                  {img.label}
                                </p>
                                <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 group">
                                  {img.url ? (
                                    <>
                                      <Image
                                        src={img.url}
                                        alt={img.label}
                                        fill
                                        className="object-cover"
                                      />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                          onClick={() => setPreviewImage(img.url)}
                                          className="p-2 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-md text-white transition-transform hover:scale-110"
                                        >
                                          <Icon icon="solar:eye-bold" width={20} />
                                        </button>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="flex items-center justify-center h-full">
                                      <Icon icon="solar:camera-broken" className="text-gray-400" width={24} />
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Application Video
                        </p>
                        <div className="w-full aspect-video bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center justify-center relative overflow-hidden group cursor-pointer border-2 border-dashed border-gray-200 dark:border-gray-700">
                          {application.video_url ? (
                            <video
                              src={application.video_url}
                              controls
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <>
                              <Icon
                                icon="solar:play-circle-bold"
                                className="text-gray-400 dark:text-gray-600 w-16 h-16 group-hover:scale-110 transition-transform"
                              />
                              <p className="absolute bottom-4 text-xs text-gray-400 font-medium">
                                No video available
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="sticky bottom-0 bg-white dark:bg-darkgray border-t dark:border-gray-700 px-6 py-2 pb-4 mt-auto">
                      <div className="flex justify-end gap-3">
                        {currentStatus === "approved" ? (
                          <Button
                            color="success"
                            size="sm"
                            className="px-4 text-sm lg:text-base"
                            onClick={() => setIsMetricsPanelOpen(true)}
                          >
                            <Icon
                              icon="solar:chart-square-bold"
                              className="mr-2"
                              width={20}
                            />
                            Back to Metrics
                          </Button>
                        ) : (
                          <>
                            <Button
                              color={"failure"}
                              onClick={handleDecline}
                              disabled={isProcessing}
                              className="px-4 !py-1 rounded-lg font-medium transition-colors"
                            >
                              {isProcessing ? (
                                <Icon icon="line-md:loading-twotone-loop" className="mr-2" width={16} />
                              ) : (
                                <LiaTimesSolid size={16} className="mr-2" />
                              )}
                              Decline
                            </Button>
                            <Button
                              color="success"
                              size="sm"
                              className="px-4 text-sm lg:text-base"
                              disabled={isProcessing}
                              onClick={handleApprove}
                            >
                              {isProcessing ? (
                                <Icon icon="line-md:loading-twotone-loop" className="mr-2" width={20} />
                              ) : (
                                <IoMdCheckmark size={16} className="mr-2" />
                              )}
                              Approve
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="metrics"
                    initial={{ x: application.status === "approved" ? "-100%" : "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: application.status === "approved" ? "-100%" : "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="flex flex-col h-full overflow-hidden"
                  >
                    <div className="sticky top-0 bg-white dark:bg-darkgray border-b dark:border-gray-700 z-50">
                      <div className="flex items-center justify-between px-6 py-4">
                        <DialogTitle className="text-xl font-bold">
                          Application Metrics
                        </DialogTitle>
                        {/* <Button
                          color="light"
                          size="xs"
                          onClick={() => setIsMetricsPanelOpen(false)}
                        >
                          <Icon
                            icon="solar:arrow-left-linear"
                            className="mr-2"
                            width={16}
                          />
                          Back
                        </Button> */}
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                          <Image
                            src={
                              application.profile_picture_url ||
                              "/images/placeholder.png"
                            }
                            alt={application.fullname}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg dark:text-white">
                            {application.fullname}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            @{application.user?.username || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                              <Icon icon="solar:eye-bold" width={20} />
                            </div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                              Total Votes
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {application.votes_count || 0}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/50">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg text-purple-600 dark:text-purple-400">
                              <Icon icon="solar:heart-bold" width={20} />
                            </div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                              Total Likes
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {application.likes_count || 0}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/50">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg text-orange-600 dark:text-orange-400">
                              <Icon icon="solar:share-bold" width={20} />
                            </div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                              Shares
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {application.gifts_count || 0}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg text-green-600 dark:text-green-400">
                              <Icon icon="solar:chat-square-bold" width={20} />
                            </div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                              Comments
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {application.comments_count || 0}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/50">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg text-yellow-600 dark:text-yellow-400">
                              <Icon icon="solar:gift-bold" width={20} />
                            </div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                              Total Gifts
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {application.gifts_count || 0}
                          </p>
                        </div>
                      </div>

                      {/* <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <h4 className="font-semibold mb-4 dark:text-white">Activity Overview</h4>
                        <div className="h-64 gap-2">
                          {[40, 65, 30, 80, 55, 90, 45, 60, 75, 50, 85, 70].map((height, i) => (
                            <div key={i} className="w-full bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-lg relative group" style={{ height: `${height}%` }}>
                              <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded">
                                {height * 10}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-400">
                          <span>Jan</span><span>Dec</span>
                        </div>
                      </div> */}
                    </div>

                    <div className="sticky bottom-0 bg-white dark:bg-darkgray border-t dark:border-gray-700 px-6 py-2 pb-4 mt-auto">
                      <div className="flex justify-end gap-3">
                        <Button
                          color="success"
                          size="sm"
                          className="px-4 text-sm lg:text-base"
                          onClick={() => setIsMetricsPanelOpen(false)}
                        >
                          <Icon
                            icon="solar:user-circle-bold"
                            className="mr-2"
                            width={20}
                          />
                          View Application
                        </Button>
                        <Button
                          color="gray"
                          size="sm"
                          onClick={onClose}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </DialogPanel>
          </div>
        </Dialog>
      )}

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <Dialog
            static
            open={!!previewImage}
            onClose={() => setPreviewImage(null)}
            className="relative z-[60]"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm"
            />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <DialogPanel
                as={motion.div}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative max-w-4xl w-full h-[80vh] flex flex-col items-center justify-center"
              >
                <div className="absolute top-0 right-0 p-4 z-10">
                  <button
                    onClick={() => setPreviewImage(null)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                  >
                    <Icon icon="solar:close-circle-bold" width={32} />
                  </button>
                </div>
                <div className="relative w-full h-full">
                  <Image
                    src={previewImage}
                    alt="Preview"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </DialogPanel>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default ATCDetailsDialog;
