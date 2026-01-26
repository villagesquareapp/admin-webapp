"use client";
import { useState, useEffect } from "react";
import ATCSmallCards from "./ATCSmallCards";
import { getUserStats } from "@/app/api/user";
import shape1 from "/public/images/shapes/danger-card-shape.png";
import shape2 from "/public/images/shapes/secondary-card-shape.png";
import shape3 from "/public/images/shapes/success-card-shape.png";
import { Button } from "@headlessui/react";
import { Icon } from "@iconify/react";
import { getATCStats } from "@/app/api/atc";



const StatsWithMonthsFilter = ({ initialStats }: { initialStats: any }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [atcStats, setAtcStats] = useState(initialStats);
  const [isLoading, setIsLoading] = useState(false);


  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  useEffect(() => {
    const currentMonth = new Date().getMonth() + 1;
    setSelectedMonth(currentMonth.toString());
  }, []);

  useEffect(() => {
    if (selectedMonth && showHistory) {
      const fetchStats = async () => {
        setIsLoading(true);
        try {
          const stats = await getATCStats();
          setAtcStats(stats);
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
          <Button
            onClick={() => setShowHistory(false)}
            className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors px-0 py-2"
          >
            <Icon icon="solar:arrow-left-linear" width={20} />
            Back to Dashboard
          </Button>
        ) : (
          <div className="flex-1"></div>
        )}

        <div className="flex gap-4 items-center">
          {showHistory ? (
            <div className="flex gap-4 items-center">


              <div className="w-48">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setShowHistory(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
            >
              <Icon icon="solar:history-bold-duotone" width={20} />
              View Past Applications
            </Button>
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


    </div >
  );
};
export default StatsWithMonthsFilter;
