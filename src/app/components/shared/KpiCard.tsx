"use client";

import { Icon } from "@iconify/react";

const fmt = (n: number) => new Intl.NumberFormat("en", { notation: "compact" }).format(n || 0);

/** Compact stat tile for overview KPI rows — tight vertical padding. */
const KpiCard = ({
  icon,
  value,
  label,
  tone,
}: {
  icon: string;
  value: number;
  label: string;
  tone: string;
}) => (
  <div className="bg-white dark:bg-darkgray border border-ld rounded-xl px-3.5 py-3 shadow-sm">
    <span className={`size-8 rounded-md grid place-items-center ${tone}`}>
      <Icon icon={icon} height={17} />
    </span>
    <p className="text-lg font-bold tabular-nums mt-2 leading-none">{fmt(value)}</p>
    <p className="text-[11px] text-darklink mt-1">{label}</p>
  </div>
);

export default KpiCard;
