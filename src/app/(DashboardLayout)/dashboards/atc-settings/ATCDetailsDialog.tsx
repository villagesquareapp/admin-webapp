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
import { useState } from "react";

const ATCDetailsDialog = ({
  isOpen,
  setIsOpen,
  user,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  user?: IUser | null;
}) => {
  if (!user) return null;

  const userProfile = user.user_details.profile;
  const [isMetricsPanelOpen, setIsMetricsPanelOpen] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          static
          open={isOpen}
          onClose={() => setIsOpen(false)}
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
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="flex flex-col h-full overflow-hidden"
                  >
                    <div className="sticky top-0 bg-white dark:bg-darkgray border-b dark:border-gray-700 z-50">
                      <div className="flex items-center justify-between px-6 py-4">
                        <DialogTitle className="text-xl font-bold">
                          ATC Details
                        </DialogTitle>
                        <Button onClick={() => setIsOpen(false)} className="p-1">
                          <Icon icon="solar:close-circle-bold" height={14} />
                        </Button>
                      </div>
                    </div>

                    <div className="overflow-y-auto p-6 space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 border-2 border-gray-100 dark:border-gray-700">
                          <Image
                            src={
                              userProfile.profile_picture ||
                              "/images/placeholder.png"
                            }
                            alt={userProfile.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h3 className="text-xl font-bold flex items-center gap-2">
                            {userProfile.name}
                            {userProfile.checkmark_verification_status && (
                              <Icon
                                icon="solar:verified-check-bold"
                                className="text-blue-500"
                                width={20}
                              />
                            )}
                            {userProfile.premium_verification_status && (
                              <Icon
                                icon="solar:star-bold"
                                className="text-yellow-500"
                                width={20}
                              />
                            )}
                          </h3>
                          <div className="flex gap-2 mt-2">
                            <span
                              className={`px-3 py-1 text-xs rounded-full font-medium capitalize
                        ${userProfile.status === "active"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : userProfile.status === "suspended"
                                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                }`}
                            >
                              {userProfile.status}
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
                            {userProfile.followers || "Singer"}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Application Type
                          </p>
                          <p className="font-medium">
                            {user.user_details.posts.length || "0"}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Profe
                          </p>
                          <p className="font-medium break-all">{userProfile.email}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Date Joined
                          </p>
                          <p className="font-medium">
                            {formatDate(userProfile.created_at)}
                          </p>
                        </div>
                      </div>

                      {userProfile.bio && (
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Bio
                          </p>
                          <p className="text-sm leading-relaxed">{userProfile.bio}</p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Application Video
                        </p>
                        <div className="w-full aspect-video bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center justify-center relative overflow-hidden group cursor-pointer border-2 border-dashed border-gray-200 dark:border-gray-700">
                          <Icon
                            icon="solar:play-circle-bold"
                            className="text-gray-400 dark:text-gray-600 w-16 h-16 group-hover:scale-110 transition-transform"
                          />
                          <p className="absolute bottom-4 text-xs text-gray-400 font-medium">
                            No video available
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="sticky bottom-0 bg-white dark:bg-darkgray border-t dark:border-gray-700 px-6 py-2 pb-4 mt-auto">
                      <div className="flex justify-end gap-3">
                        {userProfile.status === "active" ? (
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
                            View Metrics
                          </Button>
                        ) : (
                          <>
                            <Button
                              color={"failure"}
                              onClick={() => setIsOpen(false)}
                              className="px-4 !py-1 rounded-lg font-medium transition-colors"
                            >
                              <LiaTimesSolid size={16} />
                              Decline
                            </Button>
                            <Button
                              color="success"
                              size="sm"
                              className="px-4 text-sm lg:text-base"
                            // onClick={() => setIsApproveDialogOpen(true)}
                            >
                              <IoMdCheckmark size={16} />
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
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="flex flex-col h-full overflow-hidden"
                  >
                    <div className="sticky top-0 bg-white dark:bg-darkgray border-b dark:border-gray-700 z-50">
                      <div className="flex items-center justify-between px-6 py-4">
                        <DialogTitle className="text-xl font-bold">
                          Application Metrics
                        </DialogTitle>
                        <Button color="light" size="xs" onClick={() => setIsMetricsPanelOpen(false)}>
                          <Icon icon="solar:arrow-left-linear" className="mr-2" width={16} />
                          Back
                        </Button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                          <Image
                            src={
                              userProfile.profile_picture ||
                              "/images/placeholder.png"
                            }
                            alt={userProfile.name}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg dark:text-white">{userProfile.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">@{userProfile.username}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                              <Icon icon="solar:eye-bold" width={20} />
                            </div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Views</span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">12.5k</p>
                          <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                            <Icon icon="solar:graph-up-linear" />
                            +12% from last month
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/50">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg text-purple-600 dark:text-purple-400">
                              <Icon icon="solar:heart-bold" width={20} />
                            </div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Likes</span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">3,420</p>
                          <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                            <Icon icon="solar:graph-up-linear" />
                            +5% from last month
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/50">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg text-orange-600 dark:text-orange-400">
                              <Icon icon="solar:share-bold" width={20} />
                            </div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Shares</span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">892</p>
                          <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                            <Icon icon="solar:graph-down-linear" />
                            -2% from last month
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg text-green-600 dark:text-green-400">
                              <Icon icon="solar:chart-square-bold" width={20} />
                            </div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Engagement</span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">8.5%</p>
                          <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                            <Icon icon="solar:graph-up-linear" />
                            +1.2% from last month
                          </p>
                        </div>
                      </div>

                      <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <h4 className="font-semibold mb-4 dark:text-white">Activity Overview</h4>
                        {/* <div className="h-64 flex items-end justify-between gap-2"> */}
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
                      </div>
                    </div>

                    <div className="sticky bottom-0 bg-white dark:bg-darkgray border-t dark:border-gray-700 px-6 py-2 pb-4 mt-auto">
                      <div className="flex justify-end gap-3">
                        <Button color="gray" onClick={() => setIsMetricsPanelOpen(false)}>
                          Close
                        </Button>
                        <Button color="success">
                          <IoMdCheckmark className="mr-2" />
                          Download Report
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
    </AnimatePresence>
  );
};

export default ATCDetailsDialog;
