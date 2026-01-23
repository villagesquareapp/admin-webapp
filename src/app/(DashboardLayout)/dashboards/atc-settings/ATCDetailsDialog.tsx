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
                        userProfile.profile_picture || "/images/placeholder.png"
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
                    {/* <p className="text-gray-500 dark:text-gray-400">
                      @{userProfile.username}
                    </p> */}
                    <div className="flex gap-2 mt-2">
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-medium capitalize
                        ${
                          userProfile.status === "active"
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
                    {/* Abstract placeholder */}
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

              <div className="sticky bottom-0 bg-white dark:bg-darkgray border-t dark:border-gray-700 px-6 py-2">
                <div className="flex justify-end gap-3">
                  <Button
                    color={"failure"}
                    onClick={() => setIsOpen(false)}
                    className="px-4 !py-1 rounded-lg font-medium transition-colors"
                  >
                    <LiaTimesSolid size={16} />
                    Decline
                  </Button>
                  {/* <Button
                    color={'success'}
                    onClick={() => {
                      // Handle submit logic here
                      console.log("Submitted user:", user);
                      setIsOpen(false);
                    }}
                    className="px-4 text-sm lg:text-base font-medium text-white"
                  >
                    Approve
                  </Button> */}
                  <Button
                    color="success"
                    size="sm"
                    className="px-4 text-sm lg:text-base"
                    // onClick={() => setIsApproveDialogOpen(true)}
                  >
                    <IoMdCheckmark size={16} />
                    Approve
                  </Button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default ATCDetailsDialog;
