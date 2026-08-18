"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import ATCSmallCards from "./ATCSmallCards";
import { getUserStats } from "@/app/api/user";
import shape1 from "/public/images/shapes/danger-card-shape.png";
import shape2 from "/public/images/shapes/secondary-card-shape.png";
import shape3 from "/public/images/shapes/success-card-shape.png";
import { Button } from "@headlessui/react";
import { Icon } from "@iconify/react";
import { getATCStats, getATCPeriods, getATCChallengeInfo } from "@/app/api/atc";
import { Spinner } from "flowbite-react";

const StatsWithMonthsFilter = ({ initialStats }: { initialStats: any }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [showHistory, setShowHistory] = useState(false);
  const periodParam = searchParams.get("period")?.toString() || "";
  const [selectedMonth, setSelectedMonth] = useState<string>(periodParam);
  const [atcStats, setAtcStats] = useState(initialStats);
  const [isLoading, setIsLoading] = useState(false);
  const [periods, setPeriods] = useState<IATCPeriod[]>([]);
  const [currentEpisodeName, setCurrentEpisodeName] = useState<string>("");
  const [selectedEpisodeName, setSelectedEpisodeName] = useState<string>("");

  // Sync local state with URL param if it changes externally or on load
  useEffect(() => {
    if (periodParam) {
      setSelectedMonth(periodParam);
    }
  }, [periodParam]);

  const handlePeriodChange = (val: string) => {
    setSelectedMonth(val);
    const params = new URLSearchParams(searchParams);
    if (val) {
      params.set("period", val);
    } else {
      params.delete("period");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const handleViewPastEpisodes = () => {
    setShowHistory(true);
    if (selectedMonth) {
      handlePeriodChange(selectedMonth);
    } else if (periods.length > 0) {
      handlePeriodChange(periods[0].value);
    }
  };

  const handleBackToDashboard = () => {
    setShowHistory(false);
    handlePeriodChange("");
  };

  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const res = await getATCPeriods();
        if (res?.status && res?.data?.periods) {
          setPeriods(res.data.periods);
          if (res.data.periods.length > 0) {
            setSelectedMonth(res.data.periods[0].value);
          }
        }
      } catch (error) {
        console.error("Error fetching periods:", error);
      }
    };
    fetchPeriods();
  }, []);

  // Fetch current month episode name
  useEffect(() => {
    const fetchCurrentEpisode = async () => {
      try {
        const res = await getATCChallengeInfo();
        if (res?.status && res?.data?.episode?.name) {
          setCurrentEpisodeName(res.data.episode.name);
        }
      } catch (error) {
        console.error("Error fetching current episode:", error);
      }
    };
    fetchCurrentEpisode();
  }, []);

  useEffect(() => {
    if (selectedMonth && showHistory) {
      const fetchStats = async () => {
        setIsLoading(true);
        try {
          const stats = await getATCStats(selectedMonth);
          setAtcStats(stats);
          
          // Fetch selected month episode name
          const episodeRes = await getATCChallengeInfo(selectedMonth);
          if (episodeRes?.status && episodeRes?.data?.episode?.name) {
            setSelectedEpisodeName(episodeRes.data.episode.name);
          }
        } catch (error) {
          console.error("Error fetching stats:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchStats();
    } else if (!showHistory) {
      setAtcStats(initialStats);
    }
  }, [selectedMonth, showHistory, initialStats]);

  const homeData: IOverviewData[] = [
    {
      total: atcStats?.data?.applications?.overall?.total || 0,
      icon: "eos-icons:application",
      bgcolor: "secondary",
      title: "Overall Total Applications",
      shape: shape1,
      link: "",
    },
    {
      total: atcStats?.data?.applications?.period?.total || 0,
      icon: "solar:calendar-date-bold-duotone",
      bgcolor: "primary",
      title: "Current Month Total Applications",
      shape: shape3,
      link: "",
    },
    {
      total: atcStats?.data?.applications?.period?.pending || 0,
      icon: "solar:clock-circle-bold-duotone",
      bgcolor: "warning",
      title: "Current Month Total Pending",
      shape: shape2,
      link: "",
    },
    {
      total: atcStats?.data?.applications?.period?.approved || 0,
      icon: "solar:check-circle-bold-duotone",
      bgcolor: "success",
      title: "Current Month Total Approved",
      shape: shape3,
      link: "",
    },
    {
      total: atcStats?.data?.applications?.period?.declined || 0,
      icon: "solar:close-circle-bold-duotone",
      bgcolor: "error",
      title: "Current Month Total Declined",
      shape: shape1,
      link: "",
    },
  ];

  const historyData: IOverviewData[] = [
    {
      total: atcStats?.data?.applications?.period?.total || 0,
      icon: "eos-icons:application",
      bgcolor: "secondary",
      title: "Total Applications",
      shape: shape1,
      link: "",
    },
    {
      total: atcStats?.data?.applications?.period?.pending || 0,
      icon: "solar:clock-circle-bold-duotone",
      bgcolor: "warning",
      title: "Pending Applications",
      shape: shape2,
      link: "",
    },
    {
      total: atcStats?.data?.applications?.period?.approved || 0,
      icon: "solar:check-circle-bold-duotone",
      bgcolor: "success",
      title: "Approved Applications",
      shape: shape3,
      link: "",
    },
    {
      total: atcStats?.data?.applications?.period?.declined || 0,
      icon: "solar:close-circle-bold-duotone",
      bgcolor: "error",
      title: "Declined Applications",
      shape: shape1,
      link: "",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {showHistory ? (
          <div className="flex justify-start items-start gap-3">
            <Button
              onClick={handleBackToDashboard}
              className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors px-0 py-2"
            >
              <Icon icon="solar:arrow-left-linear" width={20} />
              Back to current month
            </Button>
            <Button
              className={
                "px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
              }
            >
              {selectedEpisodeName || <Spinner />}
            </Button>
          </div>
        ) : (
          <Button
            className={
              "px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
            }
          >
            {currentEpisodeName || <Spinner />}
          </Button>
        )}

        <div className="flex gap-4 items-center">
          {showHistory ? (
            <div className="flex gap-4 items-center">
              <div className="w-48">
                <select
                  value={selectedMonth}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {periods.map((period) => (
                    <option key={period.value} value={period.value}>
                      {period.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <Button
                onClick={handleViewPastEpisodes}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
              >
                <Icon icon="solar:history-bold-duotone" width={20} />
                View Past Episodes
              </Button>
            </div>
          )}
        </div>
      </div>
      <div
        className={
          isLoading
            ? "opacity-50 pointer-events-none transition-opacity"
            : "transition-opacity"
        }
      >
        <ATCSmallCards overviewData={showHistory ? historyData : homeData} />
      </div>
    </div>
  );
};
export default StatsWithMonthsFilter;
