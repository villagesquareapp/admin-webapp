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
import { Fragment } from "react";
import Image from "next/image";

interface LeaderboardUser {
  rank: number;
  name: string;
  votes: number;
  likes: number;
  comments: number;
  shares: number;
  gifts: number;
  profilePicture: string;
}

const leaderboardData: LeaderboardUser[] = [
  {
    rank: 1,
    name: "Olakunle Lexy",
    votes: 3650,
    likes: 1200,
    comments: 450,
    shares: 300,
    gifts: 150,
    profilePicture: "/images/profile/user-1.jpg",
  },
  {
    rank: 2,
    name: "Aisha Toluwalase",
    votes: 2217,
    likes: 980,
    comments: 320,
    shares: 150,
    gifts: 80,
    profilePicture: "/images/profile/user-2.jpg",
  },
  {
    rank: 3,
    name: "Leila Bukola",
    votes: 1150,
    likes: 600,
    comments: 200,
    shares: 100,
    gifts: 40,
    profilePicture: "/images/profile/user-3.jpg",
  },
  {
    rank: 4,
    name: "Sanni Bello",
    votes: 900,
    likes: 450,
    comments: 180,
    shares: 80,
    gifts: 30,
    profilePicture: "/images/profile/user-4.jpg",
  },
  {
    rank: 5,
    name: "Oluwapelumi Fafiyebi",
    votes: 812,
    likes: 400,
    comments: 160,
    shares: 70,
    gifts: 25,
    profilePicture: "/images/profile/user-5.jpg",
  },
  {
    rank: 6,
    name: "Abdullahi Musa",
    votes: 459,
    likes: 250,
    comments: 100,
    shares: 40,
    gifts: 15,
    profilePicture: "/images/profile/user-6.jpg",
  },
  {
    rank: 7,
    name: "Ahmed Onibiyo",
    votes: 420,
    likes: 230,
    comments: 90,
    shares: 35,
    gifts: 12,
    profilePicture: "/images/profile/user-7.jpg",
  },
  {
    rank: 8,
    name: "Temilade Praise",
    votes: 380,
    likes: 200,
    comments: 80,
    shares: 30,
    gifts: 10,
    profilePicture: "/images/profile/user-8.jpg",
  },
  {
    rank: 9,
    name: "Grace Adebayo",
    votes: 350,
    likes: 180,
    comments: 70,
    shares: 25,
    gifts: 8,
    profilePicture: "/images/profile/user-9.jpg",
  },
  {
    rank: 10,
    name: "Otunola Akerele",
    votes: 300,
    likes: 150,
    comments: 60,
    shares: 20,
    gifts: 5,
    profilePicture: "/images/profile/user-2.jpg",
  }, // Reuse image for example
];

const LeaderboardModal = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}) => {
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
                  </DialogTitle>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                  >
                    <Icon icon="solar:close-circle-bold" width={24} />
                  </button>
                </div>

                <div className="mt-4 space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  {leaderboardData.map((user) => (
                    <div
                      key={user.rank}
                      className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 
                        ${
                          user.rank === 1
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
                        ${
                          user.rank === 1
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

                      {/* <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {user.rank === 1 && (
                          <Icon
                            icon="solar:cup-first-bold"
                            className="text-green-500 w-6 h-6"
                          />
                        )}
                        {user.rank === 2 && (
                          <Icon
                            icon="solar:cup-star-bold"
                            className="text-gray-400 w-6 h-6"
                          />
                        )}
                        {user.rank === 3 && (
                          <Icon
                            icon="solar:medal-ribbon-bold"
                            className="text-yellow-600 w-6 h-6"
                          />
                        )}
                        {user.rank > 3 && user.rank <= 6 && (
                          <Icon
                            icon="solar:map-arrow-up-bold"
                            className="text-green-500 w-5 h-5"
                          />
                        )}
                        {user.rank > 6 && (
                          <Icon
                            icon="solar:map-arrow-down-bold"
                            className="text-red-500 w-5 h-5"
                          />
                        )}
                      </div> */}

                      <div className="ml-6 flex items-center gap-4 flex-1">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 shrink-0">
                          <Image
                            src={user.profilePicture}
                            alt={user.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4
                              className={`text-base font-bold truncate ${user.rank <= 3 ? "text-white" : "text-gray-900 dark:text-white"}`}
                            >
                              {user.name}
                            </h4>
                          </div>
                          <p
                            className={`text-sm ${user.rank <= 3 ? "text-gray-300" : "text-gray-500 dark:text-gray-400"}`}
                          >
                            {user.votes.toLocaleString()} Votes
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
                            {user.likes}
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
                            {user.comments}
                          </span>
                        </div>
                        <div
                          className="flex flex-col items-center gap-0.5"
                          title="Shares"
                        >
                          <Icon
                            icon="solar:share-bold"
                            className={`w-4 h-4 ${user.rank <= 3 ? "text-purple-400" : "text-purple-500"}`}
                          />
                          <span
                            className={`text-xs font-medium ${user.rank <= 3 ? "text-gray-300" : "text-gray-600 dark:text-gray-400"}`}
                          >
                            {user.shares}
                          </span>
                        </div>
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
                            {user.gifts}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
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
