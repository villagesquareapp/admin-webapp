import { Suspense } from "react";
import SuiteHeader from "../business-suite/SuiteHeader";
import { getATCCycle, getATCSettings } from "@/app/api/atc";
import ATCCycleCard from "./ATCCycleCard";
import ATCSettingsForm from "./ATCSettingsForm";

const SettingsWrapper = async () => {
  const [cycle, settings] = await Promise.all([getATCCycle(), getATCSettings()]);
  return (
    <div className="flex flex-col gap-5">
      <ATCCycleCard cycle={cycle?.data ?? null} />
      <ATCSettingsForm settings={settings?.data || null} />
    </div>
  );
};

const Page = async () => (
  <div className="flex flex-col gap-5">
    <SuiteHeader
      title="ATC Management"
      subtitle="The monthly Africa Talent Challenge cycle, its timeline and How it works content."
      back="/dashboards/business-suite"
    />
    <Suspense fallback={<div className="h-[500px] w-full animate-pulse bg-lightgray dark:bg-white/5 rounded-3xl" />}>
      <SettingsWrapper />
    </Suspense>
  </div>
);

export default Page;
