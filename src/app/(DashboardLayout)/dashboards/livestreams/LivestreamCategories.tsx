"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "flowbite-react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import CardBox from "@/app/components/shared/CardBox";

interface Props {
  initialCategories: ITopPerformanceCategory[];
}

const LivestreamCategories: React.FC<Props> = ({ initialCategories }) => {
  const categories = initialCategories;
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);

  // Show top 4 in the single row
  const topCategories = categories.slice(0, 4);

  return (
    <>
      <CardBox>
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-lg font-semibold">Top Performing Categories</h5>
          {categories.length > 4 && (
            <button
              onClick={() => setIsViewAllOpen(true)}
              className="text-sm text-primary hover:underline font-medium"
            >
              View all
            </button>
          )}
        </div>
        <hr className="dark:border-white/20 mb-4" />

        {categories.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm text-gray-400">No category data yet</p>
          </div>
        ) : (
          <div className="flex items-center gap-4 overflow-x-auto">
            {topCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 min-w-[180px] flex-1"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                  {category.icon_id ? (
                    <Icon
                      icon={category.icon_id}
                      width={22}
                      className="text-primary"
                    />
                  ) : (
                    <Icon
                      icon="solar:gamepad-bold-duotone"
                      width={20}
                      className="text-gray-400"
                    />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    {category.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {category.streams_count ?? 0} streams
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBox>

      {/* View All Modal */}
      <AnimatePresence>
        {isViewAllOpen && (
          <Dialog
            static
            open={isViewAllOpen}
            onClose={() => setIsViewAllOpen(false)}
            className="relative z-50"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50"
            />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <DialogPanel
                as={motion.div}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-4xl max-h-[80vh] flex flex-col rounded-xl bg-white dark:bg-darkgray shadow-2xl"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
                  <DialogTitle className="text-lg font-bold">
                    All Categories Performance
                  </DialogTitle>
                  <button
                    onClick={() => setIsViewAllOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Icon icon="solar:close-circle-bold" height={22} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-4 gap-3">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                          {category.icon_id ? (
                            <Icon
                              icon={category.icon_id}
                              width={22}
                              className="text-primary"
                            />
                          ) : (
                            <Icon
                              icon="solar:gamepad-bold-duotone"
                              width={20}
                              className="text-gray-400"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                            {category.name}
                          </p>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {category.streams_count ?? 0} streams
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogPanel>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};

export default LivestreamCategories;
