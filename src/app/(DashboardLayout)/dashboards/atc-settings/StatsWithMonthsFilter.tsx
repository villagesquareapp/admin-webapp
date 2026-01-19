"use client";
import { useState, useEffect } from "react";
import SmallCards from "@/app/components/dashboards/ecommerce/smallCards";
import { getUserStats } from "@/app/api/user";
import shape1 from "/public/images/shapes/danger-card-shape.png";
import shape2 from "/public/images/shapes/secondary-card-shape.png";
import shape3 from "/public/images/shapes/success-card-shape.png";

const StatsWithMonthsFilter = ({ initialStats }: { initialStats: any }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [userStats, setUserStats] = useState(initialStats);
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

  // Set current month as default
  useEffect(() => {
    const currentMonth = new Date().getMonth() + 1; 
    setSelectedMonth(currentMonth.toString());
  }, []);

  // Fetch stats when month changes
  useEffect(() => {
    if (selectedMonth) {
      const fetchStats = async () => {
        setIsLoading(true);
        try {
          const stats = await getUserStats(selectedMonth);
          setUserStats(stats);
        } catch (error) {
          console.error("Error fetching stats:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchStats();
    }
  }, [selectedMonth]);

  const overviewData: IOverviewData[] = [
    {
      total: userStats?.data?.total_users || 0,
      icon: "eos-icons:application",
      bgcolor: "secondary",
      title: "Total Application",
      shape: shape1,
      link: "",
    },
    {
      total: userStats?.data?.today_new_users || 0,
      icon: "streamline-flex:credit-card-approved-solid",
      bgcolor: "primary",
      title: "Total Approved",
      shape: shape3,
      link: "",
    },
    {
      total: userStats?.data?.today_active_users || 0,
      icon: "fluent-mdl2:event-declined",
      bgcolor: "success",
      title: "Total Declined",
      shape: shape2,
      link: "",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Month Dropdown */}
      <div className="flex justify-end">
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

      {/* Stats Cards with Loading State */}
      <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
        <SmallCards overviewData={overviewData} />
      </div>
    </div>
  );
};

export default StatsWithMonthsFilter;