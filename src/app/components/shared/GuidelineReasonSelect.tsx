"use client";

import { useEffect, useState } from "react";
import { Select } from "flowbite-react";
import { getGuidelineReasons } from "@/app/api/appeals";

let loaded: IGuidelineReason[] | null = null;

/**
 * Which community guideline a suspension or ban is for. The person sees this
 * (with a link to the guideline) when they try to sign in, never staff's note.
 */
const GuidelineReasonSelect = ({
  value,
  onChange,
  emptyLabel = "Choose a guideline…",
  sizing = "md",
  className,
  id,
}: {
  value: string;
  onChange: (code: string) => void;
  emptyLabel?: string;
  sizing?: "sm" | "md";
  className?: string;
  id?: string;
}) => {
  const [reasons, setReasons] = useState<IGuidelineReason[]>(loaded ?? []);

  useEffect(() => {
    if (loaded) return;
    getGuidelineReasons()
      .then((r) => {
        if (r?.status && r.data) {
          loaded = r.data;
          setReasons(r.data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <Select id={id} sizing={sizing} value={value} onChange={(e) => onChange(e.target.value)} className={className}>
      <option value="">{emptyLabel}</option>
      {reasons.map((r) => (
        <option key={r.code} value={r.code}>
          {r.label}
        </option>
      ))}
    </Select>
  );
};

export default GuidelineReasonSelect;
