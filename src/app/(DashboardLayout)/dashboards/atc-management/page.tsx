import { getATCPeriods } from "@/app/api/atc";
import ATCSettingsButton from "./ATCSettingsButton";
import { Suspense } from "react";

const SettingsWrapper = async () => {
  const periodsResponse = await getATCPeriods();
  const activePeriod = periodsResponse?.data?.periods?.[0]?.value || "";
  return <ATCSettingsButton activePeriod={activePeriod} />;
};

const Page = async () => {
  return (
    <>
      <div className="">
        <h2 className="text-2xl font-bold mb-6">Africa Talent Challenge Management</h2>
        <p className="text-gray-500 mb-8">Manage the current ATC episode settings and participants.</p>

        <div className="flex justify-start">
          <Suspense fallback={<div className="h-10 w-32 animate-pulse bg-primary/20 rounded-lg" />}>
            <SettingsWrapper />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default Page;
