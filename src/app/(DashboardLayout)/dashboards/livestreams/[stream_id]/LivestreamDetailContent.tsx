"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import ResolveReportModal, { ReportAction } from "@/app/components/shared/ResolveReportModal";
import ModerateUserModal from "@/app/components/shared/ModerateUserModal";
import { formatDate } from "@/utils/dateUtils";
import { ECHO_STATUS_TONE, formatDuration } from "@/utils/echoLabels";
import { REPORT_STATUS_TONE } from "@/utils/moderationLabels";
import { forceEndLivestream } from "@/app/api/livestream";
import { executeModeration } from "@/app/api/moderation";

type Detail = ILivestreamDetail["stream_details"];
const fmt = (n: number) => new Intl.NumberFormat("en", { notation: "compact" }).format(n || 0);

const Stat = ({ icon, value, label }: { icon: string; value: number; label: string }) => (
  <div className="flex flex-col items-center gap-1 rounded-lg bg-white/5 py-2.5">
    <Icon icon={icon} height={17} className="text-white/80" />
    <span className="text-[13px] font-bold text-white tabular-nums">{fmt(value)}</span>
    <span className="text-[10px] text-white/50">{label}</span>
  </div>
);

const Tile = ({ icon, label, value }: { icon: string; label: string; value?: string | number | null }) => (
  <div className="bg-lightgray dark:bg-dark rounded-md p-3 min-w-0">
    <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-wide text-darklink font-semibold">
      <Icon icon={icon} height={13} /> {label}
    </div>
    <div className="text-sm font-medium mt-1 truncate">{value ?? "—"}</div>
  </div>
);

const Toggle = ({ on, label }: { on: boolean; label: string }) => (
  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${on ? "bg-lightsuccess text-success" : "bg-lightgray text-darklink dark:bg-dark"}`}>
    <Icon icon={on ? "solar:check-circle-bold" : "solar:close-circle-bold"} height={13} />{label}
  </span>
);

const LivestreamDetailContent = ({ detail, streamId }: { detail: Detail | null; streamId: string }) => {
  const router = useRouter();
  const [reportModal, setReportModal] = useState<{ id: string; action: ReportAction } | null>(null);
  const [hostModal, setHostModal] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  if (!detail) {
    return (
      <CardBox>
        <div className="py-16 text-center text-darklink">
          <Icon icon="solar:play-stream-linear" height={40} className="mx-auto mb-3" />
          <p>Livestream not found.</p>
          <Link href="/dashboards/livestreams/list" className="text-primary text-sm font-semibold mt-3 inline-block">
            ← Back to livestreams
          </Link>
        </div>
      </CardBox>
    );
  }

  const m = detail.metrics;
  const run = async (fn: () => Promise<any>, key: string, ok: string) => {
    setBusy(key);
    try {
      const res = await fn();
      const result = (res?.data as { result?: string }[] | undefined)?.[0]?.result;
      if (res?.status && (result === "executed" || result === undefined)) toast.success(ok);
      else toast.error(res?.message || "Action failed");
      router.refresh();
    } catch {
      toast.error("Action failed");
    } finally {
      setBusy(null);
    }
  };
  const moderate = (action: string, ok: string, confirm?: boolean) => {
    if (confirm && !window.confirm(`${ok} — are you sure?`)) return;
    run(() => executeModeration({ service_type: "livestream", target_id: streamId, actions: [{ action }] }), action, ok);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/dashboards/livestreams/list" className="size-9 rounded-full grid place-items-center border border-ld hover:border-primary hover:text-primary text-darklink transition">
            <Icon icon="solar:alt-arrow-left-linear" height={18} />
          </Link>
          <div className="min-w-0">
            <h4 className="text-xl font-extrabold tracking-tight truncate">{detail.title || "Untitled stream"}</h4>
            <p className="text-[11px] text-darklink font-mono">{detail.uuid}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-lightgray dark:bg-dark text-darklink font-semibold capitalize">{detail.orientation}</span>
          <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-semibold ${ECHO_STATUS_TONE[detail.status]}`}>{detail.status}</span>
          {detail.actions.can_force_end && (
            <button
              disabled={busy === "end"}
              onClick={() => window.confirm("End this livestream now?") && run(() => forceEndLivestream(streamId), "end", "Livestream ended")}
              className="text-xs font-semibold bg-error text-white px-3 py-1.5 rounded-md disabled:opacity-50"
            >
              End stream now
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 items-start">
        {/* left — cover + stats */}
        <div className="col-span-12 lg:col-span-6">
          <div className="rounded-2xl p-4 sm:p-6 bg-gradient-to-b from-[#141f33] to-[#0b1320] shadow-lg">
            <div className={`relative w-full mx-auto rounded-xl overflow-hidden bg-black/40 ${detail.orientation === "landscape" ? "aspect-video max-w-full" : "aspect-[9/16] max-w-[440px]"}`}>
              {detail.cover && <Image src={detail.cover} alt="" fill sizes="(min-width:1024px) 45vw, 90vw" className="object-cover" />}
              <span className="absolute top-3 left-3 flex items-center gap-1.5 text-[11px] font-semibold text-white bg-black/50 px-2 py-1 rounded-full">
                <Icon icon="solar:videocamera-record-bold" height={13} /> Livestream
              </span>
            </div>
            <div className="mt-5 grid grid-cols-4 gap-2">
              <Stat icon="solar:users-group-rounded-bold" value={m.viewers} label="Viewers" />
              <Stat icon="solar:heart-bold" value={m.likes} label="Likes" />
              <Stat icon="solar:gift-bold" value={m.gifts} label="Gifts" />
              <Stat icon="solar:diamond-bold" value={m.diamonds} label="Diamonds" />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white/80 capitalize">{detail.privacy}</span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white/80">{detail.timing.duration_minutes}m</span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white/60">{formatDate(detail.timing.created_at)}</span>
            </div>
          </div>
        </div>

        {/* right */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-5">
          <CardBox>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative size-12 rounded-full overflow-hidden shrink-0 ring-2 ring-primary/20 bg-muted dark:bg-dark">
                  {detail.host?.profile_picture && <Image src={detail.host.profile_picture} alt="" fill className="object-cover" />}
                </div>
                <div className="min-w-0">
                  <p className="font-bold truncate">{detail.host?.name || "Unknown host"}</p>
                  <p className="text-sm text-darklink truncate">@{detail.host?.username} · host</p>
                </div>
              </div>
              <button onClick={() => setHostModal(true)} className="text-xs font-semibold border border-ld hover:border-error hover:text-error rounded-full px-3.5 py-2 shrink-0 transition">
                Moderate host
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <button disabled={busy === "remove_content"} onClick={() => moderate("remove_content", "Stream taken down", true)} className="text-xs font-semibold bg-lighterror text-error px-3 py-1.5 rounded-md disabled:opacity-50">Take down</button>
              <button disabled={busy === "restore_content"} onClick={() => moderate("restore_content", "Stream restored")} className="text-xs font-semibold bg-lightsuccess text-success px-3 py-1.5 rounded-md disabled:opacity-50">Restore</button>
            </div>
          </CardBox>

          <CardBox>
            <h5 className="card-title mb-3">Stream metrics</h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Tile icon="solar:chat-round-linear" label="Comments" value={fmt(m.comments_count)} />
              <Tile icon="solar:share-linear" label="Shares" value={fmt(m.shares_count)} />
              <Tile icon="solar:wallet-money-linear" label="Cowries earned" value={fmt(m.cowries_earned)} />
              <Tile icon="solar:clock-circle-linear" label="Avg watch" value={formatDuration(m.avg_watch_time_seconds)} />
              <Tile icon="solar:user-plus-linear" label="New followers" value={fmt(m.new_followers)} />
              <Tile icon="solar:hand-shake-linear" label="Category" value={detail.category?.name} />
              <Tile icon="solar:flag-2-linear" label="Reports" value={`${m.report_count} (${m.open_report_count} open)`} />
              <Tile icon="solar:calendar-linear" label="Created" value={formatDate(detail.timing.created_at)} />
            </div>
          </CardBox>

          <CardBox>
            <h5 className="card-title mb-3">Stream configuration</h5>
            <div className="flex flex-wrap gap-2 mb-4">
              <Toggle on={detail.settings.comments_enabled} label="Comments" />
              <Toggle on={detail.settings.questions_enabled} label="Questions" />
              <Toggle on={detail.settings.gifting_enabled} label="Gifting" />
              <Toggle on={detail.settings.requests_enabled} label="Guest requests" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Tile icon="solar:smartphone-linear" label="Orientation" value={detail.orientation} />
              <Tile icon="solar:calendar-date-linear" label="Scheduled" value={detail.timing.start_date ? `${detail.timing.start_date} ${detail.timing.start_time || ""}` : "—"} />
              <Tile icon="solar:lock-keyhole-minimalistic-linear" label="Privacy" value={detail.privacy} />
            </div>
          </CardBox>

          <CardBox>
            <h5 className="card-title mb-3">Reports {detail.reports.length ? `· ${detail.reports.length}` : ""}</h5>
            {detail.reports.length ? (
              <div className="flex flex-col gap-2">
                {detail.reports.map((r) => {
                  const actionable = r.status === "open" || r.status === "in_review";
                  return (
                    <div key={r.uuid} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/40 dark:bg-dark">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate">{r.reason}</p>
                        <p className="text-[11px] text-darklink truncate">{r.reporter ? `@${r.reporter.username}` : "reporter"}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${REPORT_STATUS_TONE[r.status] || "bg-lightgray text-darklink dark:bg-dark"}`}>
                        {r.status.replace(/_/g, " ")}
                      </span>
                      {actionable && (
                        <button onClick={() => setReportModal({ id: r.uuid, action: "resolve" })} className="text-[11px] font-semibold text-success shrink-0">Resolve</button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-sm text-darklink py-2">No reports against this stream.</p>}
          </CardBox>
        </div>
      </div>

      <ResolveReportModal
        reportId={reportModal?.id ?? null}
        action={reportModal?.action ?? "resolve"}
        onClose={() => setReportModal(null)}
        onDone={() => router.refresh()}
      />
      <ModerateUserModal userId={hostModal ? detail.host?.uuid ?? null : null} open={hostModal} onClose={() => setHostModal(false)} onDone={() => router.refresh()} />
    </div>
  );
};

export default LivestreamDetailContent;
