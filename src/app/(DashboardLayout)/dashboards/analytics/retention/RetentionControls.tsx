"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "flowbite-react";
import SuiteHeader from "../../business-suite/SuiteHeader";
import { Segmented, SECTIONS } from "../analyticsUi";

const RetentionControls = ({
  section,
  cohort,
  grain,
}: {
  section: AnalyticsSection;
  cohort: RetentionCohortKind;
  grain: RetentionGrain;
}) => {
  const router = useRouter();
  const params = useSearchParams();

  const set = (changes: Record<string, string | null>) => {
    const p = new URLSearchParams(params.toString());
    Object.entries(changes).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    router.replace(`?${p.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-4">
      <SuiteHeader
        title="Retention"
        subtitle="Of the people who joined in a given week or month, how many kept coming back."
        back="/dashboards/analytics"
      />
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-64">
          <Select
            value={section}
            aria-label="Section"
            onChange={(e) => set({ section: e.target.value === "app" ? null : e.target.value, cohort: null })}
          >
            {SECTIONS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
        <Segmented
          value={cohort}
          onChange={(v) => set({ cohort: v === "signup" ? null : v })}
          options={[
            {
              value: "signup",
              label: "By signup",
              disabled: section !== "app",
              title: section !== "app" ? "Signup cohorts are only for the whole app" : undefined,
            },
            { value: "first_use", label: section === "app" ? "By first visit" : "By first use" },
          ]}
        />
        <Segmented
          value={grain}
          onChange={(v) => set({ grain: v === "week" ? null : v })}
          options={[
            { value: "week", label: "Weekly" },
            { value: "month", label: "Monthly" },
          ]}
        />
      </div>
    </div>
  );
};

export default RetentionControls;
