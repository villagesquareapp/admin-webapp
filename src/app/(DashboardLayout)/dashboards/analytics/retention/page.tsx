import { Suspense } from "react";
import { getRetention } from "@/app/api/analytics";
import { SECTION_KEYS } from "../sections";
import RetentionControls from "./RetentionControls";
import RetentionHeatmap from "./RetentionHeatmap";

const PERIODS = 12;

const Data = async ({ section, cohort, grain }: { section: AnalyticsSection; cohort: RetentionCohortKind; grain: RetentionGrain }) => {
  const res = await getRetention({ section, cohort, grain, periods: PERIODS });
  return <RetentionHeatmap data={res?.data ?? null} />;
};

const Page = async (props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  const params = await props.searchParams;
  const section = SECTION_KEYS.find((k) => k === params.section) ?? "app";
  // Signup cohorts only exist for the whole app.
  const cohort: RetentionCohortKind = section === "app" && params.cohort !== "first_use" ? "signup" : "first_use";
  const grain: RetentionGrain = params.grain === "month" ? "month" : "week";
  return (
    <div className="flex flex-col gap-5">
      <RetentionControls section={section} cohort={cohort} grain={grain} />
      <Suspense key={`${section}-${cohort}-${grain}`} fallback={<div className="h-[560px] w-full animate-pulse bg-lightgray dark:bg-white/5 rounded-3xl" />}>
        <Data section={section} cohort={cohort} grain={grain} />
      </Suspense>
    </div>
  );
};

export default Page;
