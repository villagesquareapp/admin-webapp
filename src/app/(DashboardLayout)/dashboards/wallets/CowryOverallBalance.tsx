"use client";
import React, { useEffect, useState } from "react";
// import CardBox from "../../shared/CardBox";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { Badge, Button, Spinner } from "flowbite-react";
import { Icon } from "@iconify/react";
import CardBox from "@/app/components/shared/CardBox";
import Link from "next/link";
import TopUpCowryComp from "./TopUpCowryComp";
import { getCowryBalance } from "@/app/api/wallet";
import { IoMdRefresh } from "react-icons/io";

const CowryOverallBalance: React.FC = () => {
  const IconData = [
    {
      icon: "solar:dollar-minimalistic-line-duotone",
      title: "0",
      subtitle: "Total Profit",
      color: "error",
    },
  ];

  const ChartData1: any = {
    series: [
      {
        name: "BTC",
        data: [3500, 2500, 4000, 2500, 5500, 3500, 2500],
      },
      {
        name: "ETH",
        data: [3000, 1500, 3100, 5000, 3000, 5500, 3500],
      },
    ],
    chart: {
      fontFamily: "inherit",
      foreColor: "#adb0bb",
      type: "line",
      toolbar: {
        show: false,
      },
    },
    legend: {
      show: false,
    },
    stroke: {
      width: 3,
      curve: "smooth",
    },
    grid: {
      show: false,
      strokeDashArray: 3,
      borderColor: "#90A4AE50",
    },
    colors: ["var(--color-primary)", "#DFE5EF"],
    markers: {
      size: 0,
    },
    yaxis: {
      show: false,
    },
    xaxis: {
      type: "category",
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July"],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    tooltip: {
      theme: "dark",
    },
  };

  const AreaChartData: any = {
    series: [
      {
        type: "area",
        name: "This Year",
        data: [
          {
            x: "Aug",
            y: 25,
          },
          {
            x: "Sep",
            y: 13,
          },
          {
            x: "Oct",
            y: 20,
          },
          {
            x: "Nov",
            y: 40,
          },
          {
            x: "Dec",
            y: 45,
          },
          {
            x: "Jan",
            y: 50,
          },
          {
            x: "Feb",
            y: 70,
          },
          {
            x: "Mar",
            y: 30,
          },
        ],
      },
      {
        type: "line",
        name: "Last Year",
        chart: {
          foreColor: "#adb0bb",
          dropShadow: {
            enabled: true,
            enabledOnSeries: undefined,
            top: 5,
            left: 0,
            blur: 3,
            color: "#000",
            opacity: 0.1,
          },
        },
        data: [
          {
            x: "Aug",
            y: 50,
          },
          {
            x: "Sep",
            y: 35,
          },
          {
            x: "Oct",
            y: 30,
          },
          {
            x: "Nov",
            y: 20,
          },
          {
            x: "Dec",
            y: 20,
          },
          {
            x: "Jan",
            y: 30,
          },
          {
            x: "Feb",
            y: 35,
          },
          {
            x: "Mar",
            y: 40,
          },
        ],
      },
    ],
    chart: {
      height: 210,
      fontFamily: "inherit",
      foreColor: "#adb0bb",
      offsetX: 0,
      animations: {
        speed: 500,
      },
      toolbar: {
        show: false,
      },
    },
    colors: ["var(--color-primary)", "rgba(119, 119, 142, 0.05)"],
    dataLabels: {
      enabled: false,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0,
        inverseColors: false,
        opacityFrom: 0.1,
        opacityTo: 0,
        stops: [100],
      },
    },
    grid: {
      borderColor: "#90A4AE30",
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    xaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      min: 0,
      max: 80,
      tickAmount: 4,
    },
    legend: {
      show: false,
    },
    tooltip: {
      theme: "dark",
    },
  };

  // Custom Tab

  const tabs = [
    { label: "Cowry Value", key: "Cowry" },
    { label: "USD Value", key: "USD" },
    { label: "NGN Value", key: "NGN" },
  ];

  const [activeTab, setActiveTab] = useState("Cowry");
  const handleTabClick = (tab: React.SetStateAction<string>) => {
    setActiveTab(tab);
  };

  const [cowryValue, setCowryValue] = useState<ICowryBalance | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const fetchCowryBalance = async () => {
    try {
      setRefreshing(true);
      const res = await getCowryBalance();
      setCowryValue(res?.data ?? null);
      setRefreshing(false);
    } catch (err) {
      console.error("Failed to fetch Paystack balance", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCowryBalance();
  }, []);
  return (
    <>
      <CardBox>
        <div className="grid grid-cols-12 gap-30">
          {/* Top Section - Balance & Tabs */}
          <div className="md:col-span-12 col-span-12 flex flex-col sm:flex-row sm:justify-between sm:items-start">
            {/* Left: Balance Info */}
            <div>
              <span className="text-sm font-light text-ld">
                VS Cowry Overall Balance{" "}
                <button
                  onClick={fetchCowryBalance}
                  className="ml-2 text-lg text-primary hover:rotate-90 transition-transform"
                >
                  <IoMdRefresh />
                </button>
              </span>
              {activeTab === "Cowry" && (
                <h3 className="text-3xl my-1">
                  {refreshing ? (
                    <Spinner size={"sm"} />
                  ) : (
                    cowryValue?.cowry_value.balance
                  )}
                </h3>
              )}
              {activeTab === "USD" && (
                <h3 className="text-3xl my-1">
                  {refreshing ? (
                    <Spinner size={"sm"} />
                  ) : (
                    cowryValue?.usd_value.balance
                  )}
                </h3>
              )}
              {activeTab === "NGN" && (
                <h3 className="text-3xl my-1">
                  {refreshing ? (
                    <Spinner size={"sm"} />
                  ) : (
                    cowryValue?.ngn_value.balance
                  )}
                </h3>
              )}
              <div className="flex gap-1 items-center">
                <Badge
                  color={"lightsuccess"}
                  icon={() => (
                    <Icon
                      icon="solar:alt-arrow-down-bold"
                      className="me-1"
                      height={17}
                    />
                  )}
                >
                  16.3%
                </Badge>
                <small className="text-xs">last 12 months</small>
              </div>
            </div>

            {/* Right: Tab Buttons */}
            <div className="sm:ml-auto mb-4 sm:mt-0 mt-6">
              <div className="flex flex-wrap bg-muted dark:bg-dark p-1 rounded-full">
                {tabs.map((tab) => (
                  <div
                    key={tab.key}
                    onClick={() => handleTabClick(tab.key)}
                    className={`py-2 px-4 rounded-full min-w-[100px] cursor-pointer text-xs font-semibold text-center transition-colors ${
                      activeTab === tab.key
                        ? "bg-white text-dark dark:bg-darkgray dark:text-white"
                        : "opacity-60 text-dark dark:text-white"
                    }`}
                  >
                    {tab.label}
                  </div>
                ))}
                {/* {["Cowry Value", "USD Value", "NGN Value"].map((label, i) => (
                  <div
                    key={label}
                    onClick={() =>
                      handleTabClick(i === 2 ? "Expenses" : "Orders")
                    }
                    className={`py-2 px-4 rounded-full min-w-[100px] cursor-pointer text-dark text-xs font-semibold text-center ${
                      activeTab === (i === 2 ? "Expenses" : "Orders")
                        ? "text-dark bg-white dark:bg-darkgray dark:text-white"
                        : "dark:text-white opacity-60"
                    }`}
                  >
                    {label}
                  </div>
                ))} */}
              </div>
            </div>
          </div>

          {/* Middle Section - Chart (left side) */}
          <div className="md:col-span-8 col-span-12">
            {activeTab === "Cowry" && (
              <Chart
                options={ChartData1}
                series={ChartData1.series}
                type="line"
                height="210px"
                width="100%"
                className="mt-4"
              />
            )}

            {activeTab === "USD" && (
              <Chart
                options={ChartData1}
                series={ChartData1.series}
                type="line"
                height="210px"
                width="100%"
                className="mt-4"
              />
            )}

            {activeTab === "NGN" && (
              <div className="mt-4 -ms-3 -me-4">
                <Chart
                  options={AreaChartData}
                  series={AreaChartData.series}
                  type="area"
                  height="210px"
                  width="100%"
                />
              </div>
            )}
          </div>

          {/* Bottom Right - Cards & Button */}
          <div className="md:col-span-4 col-span-12 pb-5">
            <div className="flex flex-col gap-2 mt-6 sm:mt-0 w-full">
              {IconData.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-3 items-center rounded-tw bg-lighthover dark:bg-darkmuted px-4 py-[18px]"
                >
                  <span
                    className={`w-14 h-10 rounded-full flex items-center justify-center bg-light${item.color} dark:bg-dark${item.color} text-${item.color}`}
                  >
                    <Icon icon={item.icon} height={24} />
                  </span>
                  <div>
                    <p className="text-darklink text-xs font-medium">
                      {item.subtitle}
                    </p>
                    <h4 className="text-sm">{item.title}</h4>
                  </div>
                </div>
              ))}
              <Button
                size={"sm"}
                className="text-xs w-full"
                onClick={() => setIsOpen(true)}
              >
                Top Up Cowry
              </Button>
              <Link
                href={"/dashboards/random-users"}
                className="mt-3 w-full block"
              >
                <Button size={"sm"} className="text-xs w-full">
                  Transfer Cowry
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardBox>

      {isOpen && (
        <TopUpCowryComp
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSuccess={fetchCowryBalance}
        />
      )}
    </>
  );
};

export default CowryOverallBalance;
