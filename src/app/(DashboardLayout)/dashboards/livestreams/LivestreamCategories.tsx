"use client";

import React from "react";
import { Icon } from "@iconify/react";
import CardBox from "@/app/components/shared/CardBox";

interface Props {
  initialCategories: ILivestreamCategory[];
}

// Mock data for top performing categories (will be replaced with real endpoint later)
const mockTopCategories = [
  { id: 1, name: "Social", streams_count: 1243, icon: "mdi:account-group" },
  { id: 2, name: "Gaming", streams_count: 987, icon: "mdi:gamepad-variant" },
  { id: 3, name: "Beauty", streams_count: 756, icon: "mdi:microphone" },
  { id: 4, name: "Tech", streams_count: 623, icon: "mdi:laptop" },
  { id: 5, name: "Music", streams_count: 512, icon: "mdi:music" },
  { id: 6, name: "Education", streams_count: 398, icon: "mdi:school" },
  { id: 7, name: "Sports", streams_count: 345, icon: "mdi:basketball" },
  { id: 8, name: "Cooking", streams_count: 289, icon: "mdi:food" },
];

const LivestreamCategories: React.FC<Props> = ({ initialCategories }) => {
  // Use real data if available, otherwise show mock data
  const categories = initialCategories.length > 0 ? initialCategories : mockTopCategories as any[];

  return (
    <CardBox>
      <div className="flex justify-between items-center mb-4">
        <h5 className="text-lg font-semibold">
          Top Performing Categories
        </h5>
      </div>
      <hr className="dark:border-white/20 mb-4" />

      {categories.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <Icon icon="solar:list-broken" width={48} className="mx-auto mb-2 text-gray-400" />
          <p className="text-base font-medium">No categories yet</p>
          <p className="text-sm text-gray-400">Categories will appear here once created</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category: any) => (
            <div
              key={category.id}
              className="flex flex-col items-center p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:shadow-md transition-shadow text-center"
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mb-3 flex items-center justify-center">
                {category.icon ? (
                  <Icon icon={category.icon_id} width={28} className="text-primary" />
                ) : (
                  <Icon icon="solar:gamepad-bold-duotone" width={24} className="text-gray-400" />
                )}
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                {category.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {category.streams_count ?? 0} streams
              </p>
            </div>
          ))}
        </div>
      )}
    </CardBox>
  );
};

export default LivestreamCategories;
