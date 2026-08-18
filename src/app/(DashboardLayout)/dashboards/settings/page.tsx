import { Suspense } from "react";
import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import { getSettings } from "@/app/api/setting";
import type { Metadata } from "next";
import SettingsComp from "./SettingsComp";

export const metadata: Metadata = {
  title: "Settings",
};

const BCrumb = [
  {
    to: "/",
    title: "Home",
  },
  {
    title: "Settings",
  },
];

const SettingsWrapper = async () => {
  const settings: ISettingsResponse | null = await getSettings();

  return (
    <>
      <BreadcrumbComp title="Settings" items={BCrumb} />
      <SettingsComp
        settings={settings && Array.isArray(settings?.data) ? settings?.data : null}
      />
    </>
  );
};

const Page = async () => {
  return (
    <Suspense fallback={<div className="h-[600px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
      <SettingsWrapper />
    </Suspense>
  );
};

export default Page;
