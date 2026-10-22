"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import CardBox from "@/app/components/shared/CardBox";
import KpiCard from "@/app/components/shared/KpiCard";
import { fmtClock, fmtDuration, PersonCell, usd } from "../meetingsUi";

const MeetingsOverview = ({ data, message }: { data: IMeetingsOverview | null; message?: string }) => {
  if (!data) {
    return (
      <CardBox>
        <p className="py-10 text-center text-sm text-darklink">{message || "Couldn't load the overview."}</p>
      </CardBox>
    );
  }
  const pm = data.assistant;
  const tiles = [
    { icon: "solar:videocamera-record-line-duotone", value: data.live_now, label: "Live now", tone: "bg-lightsuccess text-success" },
    { icon: "solar:calendar-line-duotone", value: data.meetings_7_days, label: "Meetings this week", tone: "bg-lightprimary text-primary" },
    { icon: "solar:calendar-mark-line-duotone", value: data.meetings_30_days, label: "Meetings (30 days)", tone: "bg-lightinfo text-info" },
    { icon: "solar:users-group-rounded-line-duotone", value: data.attendees_30_days, label: "Attendees (30 days)", tone: "bg-lightsecondary text-secondary" },
    { icon: "solar:clock-circle-line-duotone", value: data.latecomers_30_days, label: "Came late (30 days)", tone: "bg-lightwarning text-warning" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        {tiles.map((t) => (
          <KpiCard key={t.label} {...t} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <CardBox className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold">Live now</p>
              <p className="text-xs text-darklink">
                Average meeting this month: {fmtDuration(data.avg_duration_sec_30_days)} · {data.hosts}{" "}
                {data.hosts === 1 ? "host" : "hosts"}
              </p>
            </div>
            <Link href="/dashboards/meetings/list" className="text-sm text-primary">
              All meetings
            </Link>
          </div>
          {data.live.length === 0 ? (
            <p className="text-sm text-darklink py-6 text-center">No meetings are running right now.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border dark:divide-darkborder">
              {data.live.map((m) => (
                <Link
                  key={m.uuid}
                  href={`/dashboards/meetings/${m.uuid}`}
                  className="flex items-center gap-4 py-3 hover:bg-lightgray dark:hover:bg-darkmuted rounded-lg px-2 -mx-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{m.title}</p>
                    <p className="text-xs text-darklink">
                      {m.code} · started {fmtClock(m.started_at)}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <PersonCell person={m.host} />
                  </div>
                  <span className="text-sm tabular-nums text-darklink shrink-0">{m.here_now} in the room</span>
                </Link>
              ))}
            </div>
          )}
        </CardBox>

        <CardBox>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Icon icon="solar:cpu-bolt-line-duotone" height={18} className="text-primary" />
              AI PM
            </p>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                pm.enabled ? "bg-lightsuccess text-success" : "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
              }`}
            >
              {pm.enabled ? "On" : "Off"}
            </span>
          </div>
          <p className="text-xs text-darklink mb-4">
            Asks anyone who joins after a meeting&apos;s start time + {pm.default_grace_min} min why, then hands back to
            the speaker.
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-darklink">Check-ins (30 days)</p>
              <p className="font-semibold tabular-nums">{pm.last_30_days.calls.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-darklink">Estimated cost</p>
              <p className="font-semibold tabular-nums">{usd(pm.last_30_days.est_cost_usd)}</p>
            </div>
          </div>
          {pm.last_30_days.failed > 0 && (
            <p className="text-xs text-error mt-3">
              {pm.last_30_days.failed} call{pm.last_30_days.failed === 1 ? "" : "s"} to OpenAI failed this month.
            </p>
          )}
          <Link href="/dashboards/meetings/assistant" className="text-sm text-primary mt-4 inline-block">
            AI PM settings and usage
          </Link>
        </CardBox>
      </div>
    </div>
  );
};

export default MeetingsOverview;
