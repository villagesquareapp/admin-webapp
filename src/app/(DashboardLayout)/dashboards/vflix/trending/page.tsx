import { Suspense } from "react";
import { getVflixTrending } from "@/app/api/vflix-insights";
import VflixBreadcrumb from "../VflixBreadcrumb";
import TrendingView from "./TrendingView";

const BCrumb = [
  { to: "/", title: "Home" },
  { to: "/dashboards/vflix", title: "VFlix" },
  { title: "Trending & Hot" },
];

const Wrapper = async () => {
  const res = await getVflixTrending();
  return <TrendingView data={res?.data ?? null} />;
};

const Page = () => (
  <>
    <VflixBreadcrumb title="Trending & Hot" items={BCrumb} backTo="/dashboards/vflix" />
    <Suspense fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
      <Wrapper />
    </Suspense>
  </>
);

export default Page;
