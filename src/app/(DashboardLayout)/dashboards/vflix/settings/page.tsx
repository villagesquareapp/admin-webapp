import { Suspense } from "react";
import { getVflixSettings } from "@/app/api/vflix-insights";
import VflixBreadcrumb from "../VflixBreadcrumb";
import SettingsForm from "./SettingsForm";

const BCrumb = [
  { to: "/", title: "Home" },
  { to: "/dashboards/vflix", title: "VFlix" },
  { title: "Settings" },
];

const Wrapper = async () => {
  const res = await getVflixSettings();
  return <SettingsForm settings={res?.data ?? null} />;
};

const Page = () => (
  <>
    <VflixBreadcrumb title="VFlix Settings" items={BCrumb} backTo="/dashboards/vflix" />
    <Suspense fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
      <Wrapper />
    </Suspense>
  </>
);

export default Page;
