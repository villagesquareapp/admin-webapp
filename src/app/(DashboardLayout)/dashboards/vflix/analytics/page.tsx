import { Suspense } from "react";
import { getVflixAnalytics } from "@/app/api/vflix-insights";
import VflixBreadcrumb from "../VflixBreadcrumb";
import AnalyticsContent from "./AnalyticsContent";

const BCrumb = [
  { to: "/", title: "Home" },
  { to: "/dashboards/vflix", title: "VFlix" },
  { title: "Analytics" },
];

const Wrapper = async () => {
  const res = await getVflixAnalytics();
  return <AnalyticsContent data={res?.data ?? null} />;
};

const Page = () => (
  <>
    <VflixBreadcrumb title="VFlix Analytics" items={BCrumb} backTo="/dashboards/vflix" />
    <Suspense fallback={<div className="h-[600px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
      <Wrapper />
    </Suspense>
  </>
);

export default Page;
