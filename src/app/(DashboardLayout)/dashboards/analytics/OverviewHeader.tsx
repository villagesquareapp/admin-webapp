"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import SuiteHeader from "../business-suite/SuiteHeader";
import { Segmented } from "./analyticsUi";

const OverviewHeader = ({ days }: { days: number }) => {
  const router = useRouter();
  const params = useSearchParams();

  const setDays = (d: string) => {
    const p = new URLSearchParams(params.toString());
    p.set("days", d);
    router.replace(`?${p.toString()}`, { scroll: false });
  };

  return (
    <SuiteHeader
      title="Analytics"
      subtitle="Who uses VillageSquare, which parts of the app, and whether they come back."
      actions={
        <>
          <Link
            href="/dashboards/analytics/audience"
            className="h-10 px-3 rounded-xl border border-ld text-sm font-medium text-darklink hover:text-primary flex items-center gap-1.5"
          >
            <Icon icon="solar:users-group-two-rounded-linear" height={16} /> Audience
          </Link>
          <Segmented
            value={String(days)}
            onChange={setDays}
            options={[
              { value: "7", label: "7 days" },
              { value: "30", label: "30 days" },
              { value: "90", label: "90 days" },
            ]}
          />
        </>
      }
    />
  );
};

export default OverviewHeader;
