"use client";

import React from "react";
import CardBox from "@/app/components/shared/CardBox";

const TableLoader = () => {
    return (
        <div className="col-span-12">
            <CardBox className="border rounded-md md:rounded-3xl shadow-md border-ld overflow-hidden">
                <div className="overflow-x-auto min-h-[400px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <p className="text-gray-500 font-medium animate-pulse">Loading data...</p>
                    </div>
                </div>
            </CardBox>
        </div>
    );
};

export default TableLoader;
