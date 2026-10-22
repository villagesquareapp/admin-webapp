import { Suspense } from "react";
import { getATCSettings } from "@/app/api/atc";
import ATCSettingsForm from "./ATCSettingsForm";

const SettingsWrapper = async () => {
  const res = await getATCSettings();
  return <ATCSettingsForm settings={res?.data || null} />;
};

const Page = async () => (
  <Suspense fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
    <SettingsWrapper />
  </Suspense>
);

export default Page;
