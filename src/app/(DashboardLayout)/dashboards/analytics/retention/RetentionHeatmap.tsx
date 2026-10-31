"use client";

import { useMemo, useState } from "react";
import CardBox from "@/app/components/shared/CardBox";
import { day, LoadFailed, NotReady, num, pct, Segmented, sectionMeta } from "../analyticsUi";

type Cell = { count: number; size: number; rate: number; running: boolean } | null;

const shade = (rate: number) => ({
  backgroundColor: `color-mix(in srgb, var(--color-primary) ${Math.round(8 + rate * 82)}%, transparent)`,
});

const HeatCell = ({
  cell,
  show,
  label,
}: {
  cell: Cell;
  show: "rate" | "users";
  label: string;
}) => {
  if (!cell) return <td className="p-0.5" />;
  const empty = !cell.size;
  const tip = empty
    ? "Nobody in this cohort"
    : `${num(cell.count)} of ${num(cell.size)} people (${pct(cell.rate, 1)}) were active in ${label}${cell.running ? " · still running" : ""}`;
  return (
    <td className="p-0.5">
      <div
        title={tip}
        style={empty ? undefined : shade(cell.rate)}
        className={`h-9 min-w-[52px] rounded-md grid place-items-center text-xs tabular-nums ${
          empty ? "bg-lightgray dark:bg-white/5 text-darklink" : cell.rate > 0.5 ? "text-white font-semibold" : ""
        } ${cell.running ? "outline outline-2 -outline-offset-2 outline-dashed outline-dark/50 dark:outline-white/70" : ""}`}
      >
        {empty ? "—" : show === "rate" ? pct(cell.rate) : num(cell.count)}
      </div>
    </td>
  );
};

const RetentionHeatmap = ({ data }: { data: IAnalyticsRetention | null }) => {
  const [show, setShow] = useState<"rate" | "users">("rate");

  const cohorts = data?.cohorts ?? [];
  const width = Math.max(0, ...cohorts.map((c) => c.counts.length));

  // Weighted average per period over finished cells only.
  const average = useMemo(
    () =>
      Array.from({ length: width }, (_, k) => {
        let count = 0;
        let size = 0;
        for (const c of cohorts) {
          if (k < c.counts.length - 1 && c.size) {
            count += c.counts[k];
            size += c.size;
          }
        }
        return size ? { count, size, rate: count / size, running: false } : null;
      }),
    [cohorts, width],
  );

  if (!data) return <LoadFailed what="retention" />;
  if (!data.tracking.ready) return <NotReady />;

  const m = sectionMeta(data.section);
  const unit = data.grain === "week" ? "week" : "month";
  const joined = data.cohort === "signup" ? "signed up" : data.section === "app" ? "first opened the app" : `first used ${m.short}`;
  const periodLabel = (k: number) => (k === 0 ? `the ${unit} they ${data.cohort === "signup" ? "signed up" : "started"}` : `${unit} ${k}`);
  const cohortLabel = (start: string) => day(start, data.grain === "week" ? "MMM d, yyyy" : "MMMM yyyy");
  const anyone = cohorts.some((c) => c.size > 0);

  return (
    <CardBox>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h5 className="text-sm font-semibold">
            {m.label}: people who {joined}, by {unit}
          </h5>
          <p className="text-xs text-darklink mt-1 max-w-3xl">
            Each row is everyone who {joined} in the same {unit}. Column 0 is that {unit}; column 1 is the {unit} after, and so on.
            A cell shows how many of them were active {data.section === "app" ? "in the app" : `in ${m.short}`} in that {unit}. Darker means more came back.
            The last cell in each row, with a dashed border, is the current {unit} and is still filling in.
          </p>
        </div>
        <Segmented
          size="sm"
          value={show}
          onChange={setShow}
          options={[
            { value: "rate", label: "%" },
            { value: "users", label: "People" },
          ]}
        />
      </div>

      {!anyone ? (
        <p className="text-sm text-darklink py-8 text-center">Nobody {joined} in the last {data.periods} {unit}s.</p>
      ) : (
        <div className="overflow-x-auto -mx-1 mt-2">
          <table className="border-separate border-spacing-0 text-left">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-white dark:bg-darkgray px-2 pb-2 text-xs font-semibold text-darklink">{unit === "week" ? "Week of" : "Month"}</th>
                <th className="px-2 pb-2 text-xs font-semibold text-darklink text-right">People</th>
                {Array.from({ length: width }, (_, k) => (
                  <th key={k} className="px-0.5 pb-2 text-xs font-semibold text-darklink text-center">
                    {unit === "week" ? "Wk" : "Mo"} {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="sticky left-0 z-10 bg-white dark:bg-darkgray px-2 py-1 text-xs font-semibold whitespace-nowrap">Average</td>
                <td className="px-2 py-1 text-xs text-darklink text-right whitespace-nowrap">finished cells</td>
                {average.map((cell, k) => (
                  <HeatCell key={k} cell={cell} show={show} label={periodLabel(k)} />
                ))}
              </tr>
              <tr>
                <td colSpan={width + 2} className="h-2" />
              </tr>
              {cohorts.map((c) => (
                <tr key={c.start}>
                  <td className="sticky left-0 z-10 bg-white dark:bg-darkgray px-2 py-1 text-xs whitespace-nowrap">{cohortLabel(c.start)}</td>
                  <td className="px-2 py-1 text-xs font-semibold tabular-nums text-right">{num(c.size)}</td>
                  {Array.from({ length: width }, (_, k) => (
                    <HeatCell
                      key={k}
                      show={show}
                      label={periodLabel(k)}
                      cell={k < c.counts.length ? { count: c.counts[k], size: c.size, rate: c.rates[k] ?? 0, running: k === c.counts.length - 1 } : null}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-darklink mt-2">
        <span className="flex items-center gap-1.5">
          0%
          <span className="h-2.5 w-24 rounded-full" style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--color-primary) 8%, transparent), var(--color-primary))" }} />
          100%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3.5 rounded outline outline-2 -outline-offset-2 outline-dashed outline-dark/50 dark:outline-white/70" /> Current {unit}, still running
        </span>
        <span>Hover a cell for the exact count.</span>
      </div>
    </CardBox>
  );
};

export default RetentionHeatmap;
