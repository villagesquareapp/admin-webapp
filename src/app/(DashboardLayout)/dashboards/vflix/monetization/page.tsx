import { Suspense } from "react";
import { getVflixMonetization } from "@/app/api/vflix-insights";
import VflixBreadcrumb from "../VflixBreadcrumb";
import MonetizationContent from "./MonetizationContent";

const BCrumb = [
  { to: "/", title: "Home" },
  { to: "/dashboards/vflix", title: "VFlix" },
  { title: "Monetization" },
];

const Wrapper = async () => {
  const res = await getVflixMonetization();
  return <MonetizationContent data={res?.data ?? null} />;
};

const Page = () => (
  <>
    <VflixBreadcrumb title="VFlix Monetization" items={BCrumb} backTo="/dashboards/vflix" />
    <Suspense fallback={<div className="h-[600px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
      <Wrapper />
    </Suspense>
  </>
);

export default Page;
