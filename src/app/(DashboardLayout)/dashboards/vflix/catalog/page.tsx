import { Suspense } from "react";
import { getCatalogSummary } from "@/app/api/vflix-catalog";
import VflixBreadcrumb from "../VflixBreadcrumb";
import CatalogHub from "./CatalogHub";

const BCrumb = [
  { to: "/", title: "Home" },
  { to: "/dashboards/vflix", title: "VFlix" },
  { title: "Catalog" },
];

const HubWrapper = async () => {
  const res = await getCatalogSummary();
  return <CatalogHub summary={res?.data ?? null} />;
};

const Page = () => (
  <>
    <VflixBreadcrumb title="VFlix Catalog" items={BCrumb} backTo="/dashboards/vflix" />
    <Suspense fallback={<div className="h-[420px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
      <HubWrapper />
    </Suspense>
  </>
);

export default Page;
