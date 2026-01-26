"use client";
import { useState } from "react";
import LeaderboardModal from "./LeaderboardModal";
import { Button } from "@headlessui/react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Icon } from "@iconify/react";

const SearchAndFilter = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (status && status !== "all") {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const statuses = [
    "active",
    "suspended",
    "disabled",
    "reported",
    "flagged",
    "banned",
    "shadow_hidden",
    "archived",
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <Icon icon="solar:magnifer-linear" width={20} />
          </div>
          <input
            type="text"
            className="bg-white dark:bg-darkgray rounded-full pl-10 pr-4 py-2.5 w-full text-sm border-none focus:ring-0 placeholder:text-darklink/50 dark:placeholder:text-bodytext/50 shadow-sm"
            placeholder="Search by name or email..."
            onChange={(e) => handleSearch(e.target.value)}
            defaultValue={searchParams.get("search")?.toString()}
          />
        </div>

        <div className="w-full md:w-56">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Icon icon="solar:filter-bold-duotone" width={20} />
            </div>
            <select
              className="bg-white dark:bg-darkgray rounded-full pl-10 pr-8 py-2.5 w-full text-sm border-none focus:ring-0 shadow-sm appearance-none capitalize cursor-pointer text-gray-700 dark:text-gray-300"
              onChange={(e) => handleStatusChange(e.target.value)}
              defaultValue={searchParams.get("status")?.toString() || "all"}
            >
              <option value="all">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ")}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
              <Icon icon="solar:alt-arrow-down-linear" width={16} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-none">
        <Button
          onClick={() => setIsLeaderboardOpen(true)}
          className="w-full md:w-auto px-4 py-2.5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full hover:from-yellow-500 hover:to-yellow-700 transition-colors flex items-center justify-center gap-2 shadow-md whitespace-nowrap"
        >
          <Icon icon="la:medal" width={20} />
          View Leaderboard
        </Button>
      </div>

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        setIsOpen={setIsLeaderboardOpen}
      />
    </div>
  );
};

export default SearchAndFilter;
