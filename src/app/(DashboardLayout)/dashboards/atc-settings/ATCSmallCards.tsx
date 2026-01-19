"use client";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import CardBox from "@/app/components/shared/CardBox";

interface IOverviewData {
    total: number;
    icon: string;
    bgcolor: string;
    shape: any;
    title: string;
    link?: string;
    activeSubscribers?: number;
}

const ATCSmallCards = ({ overviewData }: { overviewData: IOverviewData[] }) => {
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
                                    className={`w-14 h-10 rounded-full flex items-center justify-center text-white mb-4  bg-${theme.bgcolor}`}
                                >
                                    <Icon icon={theme.icon} height={24} />
                                </span>

                                <div className="flex flex-col gap-2">
                                    <p className="text-darklink text-sm font-semibold opacity-80">
                                        {theme.title}
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <h5 className="text-2xl font-bold">{theme.total}</h5>
                                    </div>
                                </div>
                            </div>
                        </CardBox>
                    </Link>
                ))}
            </div>
        </>
    );
};

export default ATCSmallCards;
