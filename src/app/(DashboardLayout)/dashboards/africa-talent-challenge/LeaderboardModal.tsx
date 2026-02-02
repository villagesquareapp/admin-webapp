"use client";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Button } from "flowbite-react";
import { Icon } from "@iconify/react";
import { Fragment, useEffect, useState } from "react";
import Image from "next/image";
import { getLeaderboard } from "@/app/api/atc";

const LeaderboardModal = ({
  isOpen,
  setIsOpen,
  period,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  period?: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<ILeaderboardParticipant[]>([]);
  const [activeEpisode, setActiveEpisode] = useState<IActiveEpisode | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchLeaderboard = async () => {
        setLoading(true);
        try {
          const res = await getLeaderboard(period);
          if (res?.status && res?.data) {
            setLeaderboardData(res.data.leaderboard);
            setActiveEpisode(res.data.active_episode);
          }
        } catch (error) {
          console.error("Failed to fetch leaderboard:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchLeaderboard();
    }
  }, [isOpen, period]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => setIsOpen(false)}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-darkgray p-6 text-left align-middle shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                  <DialogTitle
                    as="h3"
                    className="text-xl font-bold leading-6 text-gray-900 dark:text-white flex items-center gap-2"
                  >
                    <Icon
                      icon="solar:cup-star-bold-duotone"
                      className="text-yellow-400"
                      width={28}
                    />
                    Ranking Details
                    {/* {(leaderboardData.length > 0 ? leaderboardData[0].episode?.name : activeEpisode?.name) && (
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2 py-1 px-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                        {leaderboardData.length > 0 ? leaderboardData[0].episode?.name : activeEpisode?.name}
                      </span>
                    )} */}
                  </DialogTitle>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                  >
                    <Icon icon="solar:close-circle-bold" width={24} />
                  </button>
                </div>

                <div className="mt-4 space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar min-h-[300px]">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                      <p className="text-gray-500 dark:text-gray-400">Loading Leaderboard...</p>
                    </div>
                  ) : leaderboardData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
                      <Icon icon="solar:clipboard-list-broken" className="text-gray-300 dark:text-gray-600 w-16 h-16" />
                      <p className="text-gray-500 dark:text-gray-400">No participants found in the leaderboard yet.</p>
                    </div>
                  ) : (
                    leaderboardData.map((user) => (
                      <div
                        key={user.uuid}
                        className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 
                        ${user.rank === 1
                            ? "bg-gray-900 text-white border-primary/50 shadow-lg shadow-primary/20"
                            : user.rank === 2
                              ? "bg-gray-800 text-gray-100 border-gray-600 shadow-md"
                              : user.rank === 3
                                ? "bg-gray-800 text-gray-100 border-yellow-700 shadow-md"
                                : "bg-white dark:bg-darkgray border-gray-100 dark:border-gray-800"
                          }`}
                      >
                        <div
                          className={`absolute -left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm shadow-sm
                        ${user.rank === 1
                              ? "bg-gradient-to-br from-green-400 to-green-600 text-white ring-2 ring-green-200"
                              : user.rank === 2
                                ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white ring-2 ring-gray-200"
                                : user.rank === 3
                                  ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white ring-2 ring-yellow-200"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                            }`}
                        >
                          {user.rank}
                        </div>

                        <div className="ml-6 flex items-center gap-4 flex-1">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 shrink-0">
                            <Image
                              src={user.profile_picture || "/images/placeholder.png"}
                              alt={user.fullname}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4
                                className={`text-base font-bold truncate ${user.rank <= 3 ? "text-white" : "text-gray-900 dark:text-white"}`}
                              >
                                {user.fullname}
                              </h4>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${user.rank <= 3 ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                }`}>
                                {user.talent}
                              </span>
                            </div>
                            <p
                              className={`text-sm ${user.rank <= 3 ? "text-gray-300" : "text-gray-500 dark:text-gray-400"}`}
                            >
                              {user.votes_count.toLocaleString()} Votes
                            </p>
                          </div>
                        </div>

                        <div className="hidden sm:flex items-center gap-4 mr-2">
                          <div
                            className="flex flex-col items-center gap-0.5"
                            title="Likes"
                          >
                            <Icon
                              icon="solar:heart-bold"
                              className={`w-4 h-4 ${user.rank <= 3 ? "text-red-400" : "text-red-500"}`}
                            />
                            <span
                              className={`text-xs font-medium ${user.rank <= 3 ? "text-gray-300" : "text-gray-600 dark:text-gray-400"}`}
                            >
                              {user.likes_count}
                            </span>
                          </div>
                          <div
                            className="flex flex-col items-center gap-0.5"
                            title="Comments"
                          >
                            <Icon
                              icon="solar:chat-line-bold"
                              className={`w-4 h-4 ${user.rank <= 3 ? "text-blue-400" : "text-blue-500"}`}
                            />
                            <span
                              className={`text-xs font-medium ${user.rank <= 3 ? "text-gray-300" : "text-gray-600 dark:text-gray-400"}`}
                            >
                              {user.comments_count}
                            </span>
                          </div>
                          {/* Gifts */}
                          <div
                            className="flex flex-col items-center gap-0.5"
                            title="Gifts"
                          >
                            <Icon
                              icon="solar:gift-bold"
                              className={`w-4 h-4 ${user.rank <= 3 ? "text-yellow-400" : "text-yellow-500"}`}
                            />
                            <span
                              className={`text-xs font-medium ${user.rank <= 3 ? "text-gray-300" : "text-gray-600 dark:text-gray-400"}`}
                            >
                              {user.gifts_count}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button color="gray" onClick={() => setIsOpen(false)}>
                    Close
                  </Button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default LeaderboardModal;
