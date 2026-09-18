"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Select } from "flowbite-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import CardBox from "@/app/components/shared/CardBox";
import ModerateUserModal from "@/app/components/shared/ModerateUserModal";
import ResolveReportModal, { ReportAction } from "@/app/components/shared/ResolveReportModal";
import { formatDate } from "@/utils/dateUtils";
import { POST_STATUS_TONE, REPORT_STATUS_TONE, actionIcon, actionLabel, actionTone } from "@/utils/moderationLabels";
import { getUserStatus, updateUserStatus } from "@/app/api/user";

type Detail = IUserDetail["user_details"];
const fmt = (n: number) => new Intl.NumberFormat("en", { notation: "compact" }).format(n || 0);

const KV = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="flex justify-between gap-3 py-1.5 text-sm border-b border-dashed border-border dark:border-darkborder last:border-0">
    <span className="text-darklink">{label}</span>
    <span className="font-medium text-right truncate max-w-[220px]">{value ?? "—"}</span>
  </div>
);

const CountTile = ({ icon, value, label }: { icon: string; value: number; label: string }) => (
  <div className="rounded-xl border border-border dark:border-darkborder p-3 text-center">
    <Icon icon={icon} height={18} className="mx-auto text-primary" />
    <p className="text-lg font-bold tabular-nums mt-1">{fmt(value)}</p>
    <p className="text-[11px] text-darklink">{label}</p>
  </div>
);

const UserDetailContent = ({ detail, userId }: { detail: Detail | null; userId: string }) => {
  const router = useRouter();
  const [moderate, setModerate] = useState(false);
  const [reportModal, setReportModal] = useState<{ id: string; action: ReportAction } | null>(null);
  const [statuses, setStatuses] = useState<IUserStatusList[]>([]);
  const [statusVal, setStatusVal] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getUserStatus().then((r) => setStatuses(r?.data || [])).catch(() => {});
  }, []);

  if (!detail) {
    return (
      <CardBox>
        <div className="py-16 text-center text-darklink">
          <Icon icon="solar:user-cross-linear" height={40} className="mx-auto mb-3" />
          <p>User not found.</p>
          <Link href="/dashboards/users/list" className="text-primary text-sm font-semibold mt-3 inline-block">← Back to users</Link>
        </div>
      </CardBox>
    );
  }

  const p = detail.profile;
  const m = detail.moderation;
  const c = detail.content_counts;

  const applyStatus = async () => {
    if (!statusVal) return;
    setBusy(true);
    try {
      const res = await updateUserStatus(userId, statusVal);
      if (res?.status) { toast.success("Status updated"); setStatusVal(""); router.refresh(); }
      else toast.error(res?.message || "Failed to update status");
    } finally { setBusy(false); }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/dashboards/users/list" className="size-9 rounded-full grid place-items-center border border-ld hover:border-primary hover:text-primary text-darklink transition">
            <Icon icon="solar:alt-arrow-left-linear" height={18} />
          </Link>
          <div className="min-w-0">
            <h4 className="text-xl font-extrabold tracking-tight truncate flex items-center gap-1.5">
              {p.name || "Unknown"}
              {p.premium ? <Icon icon="solar:crown-star-bold" className="text-warning" height={16} /> : p.check_mark ? <Icon icon="solar:verified-check-bold" className="text-info" height={16} /> : null}
            </h4>
            <p className="text-[11px] text-darklink">@{p.username} · {p.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {p.online && <span className="text-xs px-2.5 py-1 rounded-full bg-lightsuccess text-success font-semibold">Online</span>}
          <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-semibold ${POST_STATUS_TONE[p.status] || "bg-lightgray text-darklink dark:bg-dark"}`}>{p.status?.replace(/_/g, " ")}</span>
          <button onClick={() => setModerate(true)} className="text-xs font-semibold bg-error text-white px-3 py-1.5 rounded-md">Moderate user</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 items-start">
        {/* left — profile */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-5">
          <CardBox>
            <div className="relative -m-3 md:-m-4 mb-3 h-28 rounded-t-xl overflow-hidden bg-lightgray dark:bg-dark">
              {p.profile_banner && <Image src={p.profile_banner} alt="" fill className="object-cover" />}
            </div>
            <div className="flex items-end gap-3 -mt-10 px-1">
              <div className="relative size-16 rounded-full overflow-hidden ring-4 ring-white dark:ring-darkgray bg-lightgray dark:bg-dark shrink-0">
                {p.profile_picture && <Image src={p.profile_picture} alt="" fill className="object-cover" />}
              </div>
            </div>
            {p.bio && <p className="text-sm text-darklink mt-3">{p.bio}</p>}
            <div className="mt-3">
              <KV label="Email" value={p.email} />
              <KV label="Phone" value={p.phone} />
              <KV label="Account type" value={p.account_type} />
              <KV label="Signup" value={p.registration_type} />
              <KV label="Gender" value={p.gender} />
              <KV label="Location" value={[p.address?.city, p.address?.country].filter(Boolean).join(", ") || null} />
              <KV label="Timezone" value={p.address?.timezone} />
              <KV label="Private" value={p.is_private ? "Yes" : "No"} />
              <KV label="Referrals" value={p.referral_count ?? 0} />
              <KV label="Joined" value={formatDate(p.created_at)} />
            </div>
          </CardBox>

          <CardBox>
            <h5 className="card-title mb-3">Activity</h5>
            <div className="grid grid-cols-3 gap-3">
              <CountTile icon="solar:document-text-linear" value={c.posts} label="Posts" />
              <CountTile icon="solar:microphone-3-linear" value={c.echoes} label="Echoes" />
              <CountTile icon="solar:play-stream-linear" value={c.livestreams} label="Streams" />
              <CountTile icon="solar:users-group-rounded-linear" value={c.followers} label="Followers" />
              <CountTile icon="solar:user-plus-linear" value={c.following} label="Following" />
            </div>
            {(detail.coin_wallet.length > 0 || detail.cowry_wallet.length > 0) && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="rounded-xl bg-lightwarning/40 p-3">
                  <p className="text-[11px] text-darklink">Coins</p>
                  <p className="text-lg font-bold tabular-nums">{fmt(Number(detail.coin_wallet[0]?.balance) || 0)}</p>
                </div>
                <div className="rounded-xl bg-lightprimary/40 p-3">
                  <p className="text-[11px] text-darklink">Cowries</p>
                  <p className="text-lg font-bold tabular-nums">{fmt(Number(detail.cowry_wallet[0]?.balance) || 0)}</p>
                </div>
              </div>
            )}
          </CardBox>
        </div>

        {/* right — moderation */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-5">
          <CardBox>
            <h5 className="card-title mb-3">Moderation state</h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="rounded-xl border border-border dark:border-darkborder p-3">
                <p className="text-[11px] text-darklink">Strikes</p>
                <div className="flex items-center gap-1 mt-1">
                  {[0, 1, 2, 3, 4].map((i) => <span key={i} className={`w-2.5 h-4 rounded-sm ${i < m.strike_count ? "bg-error" : "bg-lightgray dark:bg-dark"}`} />)}
                  <span className="text-sm font-bold ml-1">{m.strike_count}/5</span>
                </div>
              </div>
              <div className="rounded-xl border border-border dark:border-darkborder p-3">
                <p className="text-[11px] text-darklink">Status</p>
                <p className={`text-sm font-semibold capitalize mt-1 inline-block px-2 py-0.5 rounded-full ${POST_STATUS_TONE[m.status] || ""}`}>{m.status?.replace(/_/g, " ")}</p>
              </div>
              <div className="rounded-xl border border-border dark:border-darkborder p-3">
                <p className="text-[11px] text-darklink">Suspended until</p>
                <p className="text-sm font-medium mt-1">{m.suspended_until ? formatDate(m.suspended_until) : "—"}</p>
              </div>
              <div className="rounded-xl border border-border dark:border-darkborder p-3">
                <p className="text-[11px] text-darklink">Reports</p>
                <p className="text-sm font-bold mt-1">{m.report_count} <span className="text-error font-normal">({m.open_report_count} open)</span></p>
              </div>
            </div>
            {m.moderation_reason && (
              <p className="text-xs text-darklink mb-3">Last action: <span className="text-ink dark:text-white">{m.moderation_reason}</span>{m.moderated_at ? ` · ${formatDate(m.moderated_at)}` : ""}</p>
            )}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="text-[11px] font-semibold text-darklink uppercase tracking-wide">Set status directly</label>
                <Select value={statusVal} onChange={(e) => setStatusVal(e.target.value)} className="mt-1">
                  <option value="">Choose status…</option>
                  {statuses.map((s) => <option key={s.value} value={s.value}>{s.name}</option>)}
                </Select>
              </div>
              <button onClick={applyStatus} disabled={busy || !statusVal} className="text-sm font-semibold bg-primary text-white px-4 py-2.5 rounded-md disabled:opacity-50">Apply</button>
            </div>
          </CardBox>

          {/* reports */}
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
                        <p className="text-[11px] text-darklink truncate">{r.reporter ? `@${r.reporter.username}` : "reporter"} · {r.created_at ? formatDistanceToNow(new Date(r.created_at), { addSuffix: true }) : ""}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${REPORT_STATUS_TONE[r.status] || "bg-lightgray text-darklink dark:bg-dark"}`}>{r.status.replace(/_/g, " ")}</span>
                      {actionable && <button onClick={() => setReportModal({ id: r.uuid, action: "resolve" })} className="text-[11px] font-semibold text-success shrink-0">Resolve</button>}
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-sm text-darklink py-2">No reports against this user.</p>}
          </CardBox>

          {/* enforcement history */}
          <CardBox>
            <h5 className="card-title mb-3">Enforcement history</h5>
            {detail.history.length ? (
              <div className="flex flex-col gap-2.5">
                {detail.history.map((h) => (
                  <div key={h.uuid} className="flex items-start gap-2.5">
                    <span className={`size-7 rounded-md grid place-items-center shrink-0 ${actionTone(h.action)}`}>
                      <Icon icon={actionIcon(h.action)} height={14} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium">{actionLabel(h.action)} <span className="text-[10px] text-darklink">· {h.scope}{h.service_type && h.scope === "content" ? ` (${h.service_type})` : ""}</span></p>
                      <p className="text-[11px] text-darklink truncate">{h.reason || h.result} · {h.created_at ? formatDistanceToNow(new Date(h.created_at), { addSuffix: true }) : ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-darklink py-2">No enforcement actions yet.</p>}
          </CardBox>
        </div>
      </div>

      <ModerateUserModal userId={moderate ? userId : null} open={moderate} onClose={() => setModerate(false)} onDone={() => router.refresh()} />
      <ResolveReportModal reportId={reportModal?.id ?? null} action={reportModal?.action ?? "resolve"} onClose={() => setReportModal(null)} onDone={() => router.refresh()} />
    </div>
  );
};

export default UserDetailContent;
