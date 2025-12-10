"use client";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import CardBox from "../../shared/CardBox";

const SmallCards = ({ overviewData }: { overviewData: IOverviewData[] }) => {
  // Function to get the appropriate grid columns class
  const getLgGridCols = (itemCount: number) => {
    const cols = Math.min(itemCount, 5);
    const gridMap: { [key: number]: string } = {
      1: "lg:grid-cols-1",
      2: "lg:grid-cols-2",
      3: "lg:grid-cols-3",
      4: "lg:grid-cols-4",
      5: "lg:grid-cols-5",
    };
    return gridMap[cols];
  };

  return (
    <>
      <div
        className={`grid grid-cols-1 md:grid-cols-3 ${getLgGridCols(
          overviewData.length
        )} gap-6`}
      >
        {overviewData.map((theme, index) => (
          <Link
            key={index}
            href={theme.link || "#"}
            className="h-full cursor-pointer"
          >
            <CardBox
              className={`relative !shadow-none rounded-lg h-full overflow-hidden bg-light${theme.bgcolor} dark:bg-dark${theme.bgcolor} transition-transform duration-300 hover:scale-105`}
            >
              <div className="h-full">
                <Image
                  src={theme.shape}
                  alt="shape"
                  className="absolute end-0 top-0"
                />
                <span
                  className={`w-14 h-10 rounded-full flex items-center justify-center text-white mb-8  bg-${theme.bgcolor}`}
                >
                  <Icon icon={theme.icon} height={24} />
                </span>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-1">
                      <h5 className="text-lg">{theme.total}</h5>
                      <span className="font-semibold border rounded-full border-black/5 dark:border-white/10 py-0.5 px-[10px] leading-[normal] text-xs">
                        100%
                      </span>
                    </div>
                    <p className="text-darklink text-sm mt-2 font-medium">
                      {theme.title}
                    </p>
                  </div>
                  {!theme.activeSubscribers ? null : (
                    <div className="flex flex-col items-end">
                      <h5 className="text-2xl font-semibold text-gray-700">{theme.activeSubscribers}</h5>
                      <span className="text-xs text-gray-500 mt-1">Active Subscribers</span>
                    </div>
                  )}
                </div>
              </div>
            </CardBox>
          </Link>
        ))}
      </div>
    </>
  );
};

export default SmallCards;
