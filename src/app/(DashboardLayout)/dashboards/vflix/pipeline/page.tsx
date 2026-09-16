import { Suspense } from "react";
import { getVflixPipeline } from "@/app/api/vflix-insights";
import VflixBreadcrumb from "../VflixBreadcrumb";
import PipelineContent from "./PipelineContent";

const BCrumb = [
  { to: "/", title: "Home" },
  { to: "/dashboards/vflix", title: "VFlix" },
  { title: "Pipeline" },
];

const Wrapper = async () => {
  const res = await getVflixPipeline();
  return <PipelineContent data={res?.data ?? null} />;
};

const Page = () => (
  <>
    <VflixBreadcrumb title="Transcode Pipeline" items={BCrumb} backTo="/dashboards/vflix" />
    <Suspense fallback={<div className="h-[600px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
      <Wrapper />
    </Suspense>
  </>
);

export default Page;
