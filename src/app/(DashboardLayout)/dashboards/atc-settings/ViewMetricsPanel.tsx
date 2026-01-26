"use client";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Button } from "flowbite-react";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import { LiaTimesSolid } from "react-icons/lia";
import { IoMdCheckmark } from "react-icons/io";

interface ViewMetricsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    user?: IUser | null;
}

const ViewMetricsPanel = ({
    isOpen,
    onClose,
    user,
}: ViewMetricsPanelProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <Dialog
                    static
                    open={isOpen}
                    onClose={onClose}
                    className="relative z-50"
                >
                    {/* Background overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30"
                        aria-hidden="true"
                    />

                    <div className="fixed inset-0 flex justify-end">
                        <DialogPanel
                            as={motion.div}
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            // transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="w-full max-w-[500px] md:max-w-[600px] lg:max-w-[700px] bg-white dark:bg-darkgray shadow-xl h-full flex flex-col"
                        >
                            {/* <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
                                <DialogTitle className="text-xl font-bold dark:text-white">
                                    Application Metrics
                                </DialogTitle>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <LiaTimesSolid size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {user && (
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                            <img
                                                src={user.user_details.profile.profile_picture || "/images/placeholder.png"}
                                                alt={user.user_details.profile.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg dark:text-white">{user.user_details.profile.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">@{user.user_details.profile.username}</p>
                                        </div>
                                    </div>
                                )}

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
                                    <div className="h-64 flex items-end justify-between gap-2">
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

                            <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
                                <Button color="gray" onClick={onClose}>
                                    Close
                                </Button>
                                <Button color="success">
                                    <IoMdCheckmark className="mr-2" />
                                    Download Report
                                </Button>
                            </div> */}
                        </DialogPanel>
                    </div>
                </Dialog>
            )}
        </AnimatePresence>
    );
};

export default ViewMetricsPanel;
