"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";

export const TONE: Record<string, string> = {
  primary: "bg-lightprimary text-primary",
  success: "bg-lightsuccess text-success",
  warning: "bg-lightwarning text-warning",
  secondary: "bg-lightsecondary text-secondary",
  error: "bg-lighterror text-error",
  info: "bg-lightinfo text-info",
};

export const KpiTile = ({
  label,
  value,
  icon,
  tone = "primary",
  delta,
  dtone = "text-success",
  sub,
}: {
  label: string;
  value: string;
  icon: string;
  tone?: string;
  delta?: string;
  dtone?: string;
  sub?: string;
}) => (
  <div className="bg-white dark:bg-darkgray rounded-tw shadow-md dark:shadow-dark-md p-4">
    <span className={`size-10 rounded-md grid place-items-center mb-3 ${TONE[tone]}`}>
      <Icon icon={icon} height={21} />
    </span>
    <div className="text-[22px] font-extrabold tracking-tight tabular-nums leading-none">{value}</div>
    <div className="text-xs text-darklink mt-1">{label}</div>
    {delta && (
      <div className={`text-[11.5px] font-semibold mt-2 ${dtone}`}>
        {delta} {sub && <span className="text-darklink font-medium">{sub}</span>}
      </div>
    )}
  </div>
);

export const PanelTitle = ({
  title,
  sub,
  href,
  cta,
}: {
  title: string;
  sub?: string;
  href?: string;
  cta?: string;
}) => (
  <div className="flex items-center justify-between gap-3 mb-4">
    <h5 className="text-[15px] font-bold tracking-tight">
      {title}
      {sub && <span className="text-darklink font-medium text-xs ml-2">{sub}</span>}
    </h5>
    {href && (
      <Link href={href} className="text-xs font-semibold text-primary hover:underline shrink-0">
        {cta || "View"} →
      </Link>
    )}
  </div>
);

// Horizontal bar-list row (geography, throughput, etc.)
export const BarRow = ({
  label,
  value,
  max,
  display,
  color = "var(--color-primary)",
}: {
  label: string;
  value: number;
  max: number;
  display: string;
  color?: string;
}) => (
  <div className="flex items-center gap-3 text-[12.5px]">
    <span className="w-28 shrink-0 truncate text-darklink">{label}</span>
    <div className="flex-1 h-2 rounded-full bg-lightgray dark:bg-dark overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${Math.max(4, (value / max) * 100)}%`, background: color }} />
    </div>
    <span className="w-16 text-right font-semibold tabular-nums shrink-0">{display}</span>
  </div>
);
