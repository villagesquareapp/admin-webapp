"use client";

import { useState } from "react";
import Link from "next/link";
import { Select, ToggleSwitch, Spinner } from "flowbite-react";
import { Button } from "@/app/components/shared/Button";
import { toast } from "sonner";
import { updateMeetingAssistant } from "@/app/api/meetings";
import CardBox from "@/app/components/shared/CardBox";
import KpiCard from "@/app/components/shared/KpiCard";
import { usd } from "../meetingsUi";

const GRACE = [0, 2, 5, 10, 15, 20, 30];

/** The date part of an ISO time, as the calendar day in Lagos. */
function lagosDate(iso?: string): string {
  if (!iso || isNaN(Date.parse(iso))) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date(iso));
}

const AssistantContent = ({
  settings,
  usage,
  days,
}: {
  settings: IMeetingAssistantSettings | null;
  usage: IMeetingAssistantUsage | null;
  days: number;
}) => {
  const [enabled, setEnabled] = useState(settings?.enabled ?? true);
  const [grace, setGrace] = useState(settings?.default_grace_min ?? 5);
  const [lead, setLead] = useState(settings?.lead_enabled ?? true);
  const [leadUntil, setLeadUntil] = useState(lagosDate(settings?.lead_until));
  const [saving, setSaving] = useState(false);
  const dirty =
    !!settings &&
    (enabled !== settings.enabled ||
      grace !== settings.default_grace_min ||
      lead !== settings.lead_enabled ||
      leadUntil !== lagosDate(settings.lead_until));

  const save = async () => {
    setSaving(true);
    try {
      const res = await updateMeetingAssistant({
        enabled,
        default_grace_min: grace,
        lead_enabled: lead,
        // The end of that day in Lagos.
        ...(leadUntil ? { lead_until: `${leadUntil}T23:59:59+01:00` } : {}),
      });
      if (res?.status) toast.success(enabled ? "AI PM saved" : "AI PM switched off for every meeting");
      else toast.error(res?.message || "Couldn't save");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const t = usage?.totals;
  return (
    <div className="flex flex-col gap-5">
      <CardBox>
        {!settings ? (
          <p className="text-sm text-darklink py-6 text-center">Couldn&apos;t load the AI PM settings.</p>
        ) : (
          <div className="flex flex-col gap-5 max-w-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">AI PM for every meeting</p>
                <p className="text-xs text-darklink">
                  Off takes the PM out of every meeting and stops all its calls to OpenAI and Claude.
                </p>
              </div>
              <ToggleSwitch checked={enabled} onChange={setEnabled} label="" />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">Default grace</p>
                <p className="text-xs text-darklink">
                  How long after a meeting&apos;s start before someone counts as late. Hosts can change it per meeting.
                </p>
              </div>
              <Select value={grace} onChange={(e) => setGrace(Number(e.target.value))} className="w-32 shrink-0">
                {GRACE.map((g) => (
                  <option key={g} value={g}>
                    {g} min
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">PM can lead meetings</p>
                <p className="text-xs text-darklink">
                  Runs a round of updates, answers questions, keeps time and writes notes, on Claude. When the Claude
                  credit runs out, or after this date, the PM goes back to latecomer check-in only.
                </p>
              </div>
              <ToggleSwitch checked={lead} onChange={setLead} label="" />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">Leads until</p>
                <p className="text-xs text-darklink">The last day it may lead (Lagos time), e.g. when the Claude credit expires.</p>
              </div>
              <input
                type="date"
                value={leadUntil}
                onChange={(e) => setLeadUntil(e.target.value)}
                className="w-40 shrink-0 rounded-lg border border-border dark:border-darkborder bg-transparent px-3 py-2 text-sm"
              />
            </div>
            <div>
              <Button color="primary" onClick={() => void save()} disabled={saving || !dirty}>
                {saving && <Spinner size="sm" light />}
                Save
              </Button>
            </div>
          </div>
        )}
      </CardBox>

      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Usage</p>
        <div className="flex gap-1">
          {[7, 30, 90].map((d) => (
            <Link
              key={d}
              href={`/dashboards/meetings/assistant?days=${d}`}
              className={`text-xs rounded-full px-3 py-1 ${d === days ? "bg-primary text-white" : "bg-lightgray dark:bg-darkmuted"}`}
            >
              {d} days
            </Link>
          ))}
        </div>
      </div>

      {!usage || !t ? (
        <CardBox>
          <p className="text-sm text-darklink py-6 text-center">Couldn&apos;t load usage.</p>
        </CardBox>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiCard icon="solar:cpu-bolt-line-duotone" value={t.calls} label="Calls" tone="bg-lightprimary text-primary" />
            <KpiCard icon="solar:danger-triangle-line-duotone" value={t.failed} label="Failed" tone="bg-lighterror text-error" />
            <KpiCard icon="solar:microphone-3-line-duotone" value={Math.round(t.stt_seconds)} label="Seconds listened" tone="bg-lightinfo text-info" suffix="s" />
            <div className="bg-white dark:bg-darkgray border border-ld rounded-xl px-3.5 py-3 shadow-sm">
              <p className="text-[11px] text-darklink">Estimated cost</p>
              <p className="text-lg font-bold tabular-nums mt-1">{usd(t.est_cost_usd)}</p>
              <p className="text-[11px] text-darklink mt-1">
                {usd(t.claude_cost_usd)} of it on Claude (leading)
              </p>
            </div>
          </div>
          <CardBox>
            {usage.by_day.length === 0 ? (
              <p className="text-sm text-darklink py-6 text-center">No check-ins in the last {days} days.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-darklink border-b border-border dark:border-darkborder">
                      <th className="py-2 pr-3 font-medium">Day</th>
                      <th className="py-2 pr-3 font-medium">Meetings</th>
                      <th className="py-2 pr-3 font-medium">Calls</th>
                      <th className="py-2 pr-3 font-medium">Failed</th>
                      <th className="py-2 pr-3 font-medium">Characters spoken</th>
                      <th className="py-2 pr-3 font-medium">Seconds listened</th>
                      <th className="py-2 pr-3 font-medium">Est. cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usage.by_day.map((d) => (
                      <tr key={d.day} className="border-b border-border dark:border-darkborder last:border-0 tabular-nums">
                        <td className="py-2 pr-3 whitespace-nowrap">{d.day}</td>
                        <td className="py-2 pr-3">{d.meetings}</td>
                        <td className="py-2 pr-3">{d.calls}</td>
                        <td className={`py-2 pr-3 ${d.failed ? "text-error font-medium" : ""}`}>{d.failed}</td>
                        <td className="py-2 pr-3">{d.tts_chars.toLocaleString()}</td>
                        <td className="py-2 pr-3">{Math.round(d.stt_seconds)}</td>
                        <td className="py-2 pr-3">{usd(d.est_cost_usd)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBox>
        </>
      )}
    </div>
  );
};

export default AssistantContent;
