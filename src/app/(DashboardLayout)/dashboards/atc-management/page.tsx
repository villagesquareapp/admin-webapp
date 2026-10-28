import { Suspense } from "react";
import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import { getATCCycle, getATCSettings } from "@/app/api/atc";
import ATCCycleCard from "./ATCCycleCard";
import ATCSettingsForm from "./ATCSettingsForm";

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "ATC Management" },
];

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
  <>
    <BreadcrumbComp title="ATC Management" items={BCrumb} />
    <Suspense fallback={<div className="h-[500px] w-full animate-pulse bg-lightgray dark:bg-white/5 rounded-3xl" />}>
      <SettingsWrapper />
    </Suspense>
  </>
);

export default Page;
