"use client";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import CardBox from "../../shared/CardBox";

const SmallCards = ({ overviewData }: { overviewData: IOverviewData[] }) => {
  return (
    <>
      <div className="grid lg:grid-cols-5 md:grid-cols-3 grid-cols-1 gap-30">
        {overviewData.map((theme, index) => (
          <Link key={index} href={theme.link || "#"} className="h-full cursor-pointer">
            <CardBox
              className={`relative !shadow-none rounded-lg h-full overflow-hidden bg-light${theme.bgcolor} dark:bg-dark${theme.bgcolor} transition-transform duration-300 hover:scale-105`}
            >
              <div
                className={`relative shadow-none rounded-lg p-6 h-full overflow-hidden bg-light${theme.bgcolor} dark:bg-dark${theme.bgcolor}`}
              >
                <div className="h-full">
                  <Image src={theme.shape} alt="shape" className="absolute end-0 top-0" />
                  <span
                    className={`w-14 h-10 rounded-full flex items-center justify-center text-white mb-8  bg-${theme.bgcolor}`}
                  >
                    <Icon icon={theme.icon} height={24} />
                  </span>
                  <div className="flex items-center gap-1">
                    <h5 className="text-lg">{theme.total}</h5>
                  </div>
                  {/* <span className="font-semibold border rounded-full border-black/5 dark:border-white/10 py-0.5 px-[10px] leading-[normal] text-xs">
                    {theme.percent}
                  </span> */}
                  <p className="text-darklink text-sm mt-2 font-medium">{theme.title}</p>
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
