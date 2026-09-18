"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { executeModeration } from "@/app/api/moderation";
import ResolveReportModal, { ReportAction } from "@/app/components/shared/ResolveReportModal";
import { actionIcon, actionLabel, actionTone, REPORT_STATUS_TONE } from "@/utils/moderationLabels";

type Detail = IPostDetail["post_details"];

const CONTENT_ACTIONS = [
  { action: "remove_content", label: "Take down", desc: "Remove from feed", danger: true, confirm: true },
  { action: "restore_content", label: "Restore", desc: "Reinstate the post", danger: false, confirm: false },
  { action: "limit_visibility", label: "Limit reach", desc: "Shadow / down-rank", danger: false, confirm: false },
];

const AUTHOR_ACTIONS = [
  { action: "warn_user", label: "Warn", desc: "In-app notice", danger: false, confirm: false },
  { action: "strike_user", label: "Strike", desc: "Escalates on repeat", danger: false, confirm: true },
  { action: "restrict_user", label: "Restrict", desc: "Limit account", danger: false, confirm: true },
  { action: "suspend_user", label: "Suspend", desc: "Temporary, auto-lifts", danger: true, confirm: true },
  { action: "ban_user", label: "Ban", desc: "+ force logout", danger: true, confirm: true },
  { action: "reinstate_user", label: "Reinstate", desc: "Back to active", danger: false, confirm: false },
];

const ActionButton = ({
  action,
  label,
  desc,
  danger,
  busy,
  onClick,
}: {
  action: string;
  label: string;
  desc: string;
  danger: boolean;
  busy: boolean;
  onClick: () => void;
}) => (
  <button
    disabled={busy}
    onClick={onClick}
    className={`flex items-center gap-2.5 text-left p-2.5 rounded-lg border border-border dark:border-darkborder bg-muted/40 dark:bg-dark hover:bg-lightgray dark:hover:bg-darkmuted transition-colors disabled:opacity-50 ${
      danger ? "hover:border-error" : "hover:border-primary"
    }`}
  >
    <span className={`size-8 rounded-lg grid place-items-center shrink-0 ${actionTone(action)}`}>
      <Icon icon={actionIcon(action)} height={16} />
    </span>
    <span className="min-w-0">
      <span className="block text-xs font-semibold truncate">{label}</span>
      <span className="block text-[11px] text-darklink truncate">{desc}</span>
    </span>
  </button>
);

const PostModerationPanel = ({
  postId,
  detail,
  onActed,
  showAuthor = true,
}: {
  postId: string;
  detail: Detail | null;
  onActed: () => void;
  showAuthor?: boolean;
}) => {
  const [busy, setBusy] = useState<string | null>(null);
  const [modal, setModal] = useState<{ id: string; action: ReportAction } | null>(null);

  const author = detail?.author;
  const reports = detail?.reports || [];
  const history = detail?.history || [];
  const openReports = reports.filter((r) => r.status === "open" || r.status === "in_review");
  const threadParts = detail?.thread?.part_count || 0;

  const run = async (
    action: string,
    opts?: { confirm?: boolean; label?: string; params?: Record<string, any>; busyKey?: string },
  ) => {
    if (opts?.confirm && !window.confirm(`${opts.label || actionLabel(action)} — are you sure?`)) return;
    let params: Record<string, any> | undefined = opts?.params;
    if (action === "suspend_user") {
      const days = window.prompt("Suspend for how many days?", "7");
      if (days === null) return;
      params = { ...params, duration_days: Number(days) || 7 };
    }
    setBusy(opts?.busyKey || action);
    try {
      // service_type 'post' keeps author actions in this post's enforcement context
      const res = await executeModeration({
        service_type: "post",
        target_id: postId,
        actions: [{ action, ...(params ? { params } : {}) }],
      });
      const result = (res?.data as { result?: string }[] | undefined)?.[0]?.result;
      if (res?.status && result === "executed") toast.success(`${opts?.label || actionLabel(action)} applied`);
      else if (result === "unsupported") toast.error("Action not supported for this target");
      else toast.error(res?.message || "Action failed");
      onActed();
    } catch {
      toast.error("Action failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* author risk */}
      {showAuthor && author && (
        <div className="rounded-xl border border-border dark:border-darkborder p-3">
          <div className="flex items-center gap-3">
            <div className="relative size-10 rounded-full overflow-hidden bg-lightgray dark:bg-dark shrink-0">
              {author.profile_picture && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={author.profile_picture} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">{author.name}</p>
              <p className="text-xs text-darklink truncate">@{author.username}</p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-lightgray dark:bg-dark text-darklink capitalize">
              {author.status?.replace(/_/g, " ")}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2.5">
            <span className="text-xs text-darklink">Strikes</span>
            <span className="flex gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={`w-2 h-3.5 rounded-sm ${i < (author.strike_count || 0) ? "bg-error" : "bg-lightgray dark:bg-dark"}`}
                />
              ))}
            </span>
            <span className="text-xs font-semibold">{author.strike_count || 0}/5</span>
            {author.suspended_until && (
              <span className="ml-auto text-[11px] text-warning">
                suspended until {new Date(author.suspended_until).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* content actions */}
      <div>
        <h6 className="text-xs font-bold uppercase tracking-wide text-darklink mb-2">Content</h6>
        <div className="grid grid-cols-2 gap-2">
          {CONTENT_ACTIONS.map((a) => (
            <ActionButton
              key={a.action}
              {...a}
              busy={busy === a.action}
              onClick={() => run(a.action, { confirm: a.confirm, label: a.label })}
            />
          ))}
        </div>
        {threadParts > 1 && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-dashed border-border dark:border-darkborder p-2.5">
            <Icon icon="solar:list-arrow-down-linear" height={16} className="text-primary shrink-0" />
            <span className="text-xs text-darklink flex-1">
              This is a {threadParts}-part thread. Act on the whole thread:
            </span>
            <button
              disabled={busy === "thread_down"}
              onClick={() =>
                run("remove_content", {
                  confirm: true,
                  label: `Take down all ${threadParts} parts`,
                  params: { cascade_thread: true },
                  busyKey: "thread_down",
                })
              }
              className="text-[11px] font-semibold text-error bg-lighterror px-2.5 py-1.5 rounded-md disabled:opacity-50 shrink-0"
            >
              Take down thread
            </button>
            <button
              disabled={busy === "thread_restore"}
              onClick={() =>
                run("restore_content", {
                  label: "Restore all parts",
                  params: { cascade_thread: true },
                  busyKey: "thread_restore",
                })
              }
              className="text-[11px] font-semibold text-success bg-lightsuccess px-2.5 py-1.5 rounded-md disabled:opacity-50 shrink-0"
            >
              Restore
            </button>
          </div>
        )}
      </div>

      {/* author actions */}
      <div>
        <h6 className="text-xs font-bold uppercase tracking-wide text-darklink mb-2">Author</h6>
        <div className="grid grid-cols-2 gap-2">
          {AUTHOR_ACTIONS.map((a) => (
            <ActionButton
              key={a.action}
              {...a}
              busy={busy === a.action}
              onClick={() => run(a.action, { confirm: a.confirm, label: a.label })}
            />
          ))}
        </div>
      </div>

      {/* reports */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h6 className="text-xs font-bold uppercase tracking-wide text-darklink">
            Reports · {reports.length}
          </h6>
          {openReports.length > 0 && (
            <span className="text-[11px] font-semibold text-error">{openReports.length} open</span>
          )}
        </div>
        {reports.length ? (
          <div className="flex flex-col gap-2">
            {reports.slice(0, 6).map((r) => (
              <div key={r.uuid} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/40 dark:bg-dark">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate">{r.reason}</p>
                  <p className="text-[11px] text-darklink truncate">
                    {r.reporter ? `@${r.reporter.username}` : "reporter"} ·{" "}
                    {r.created_at ? formatDistanceToNow(new Date(r.created_at), { addSuffix: true }) : ""}
                  </p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${REPORT_STATUS_TONE[r.status] || "bg-lightgray text-darklink dark:bg-dark"}`}>
                  {r.status?.replace(/_/g, " ")}
                </span>
                {(r.status === "open" || r.status === "in_review") && (
                  <button
                    onClick={() => setModal({ id: r.uuid, action: "resolve" })}
                    className="text-[11px] font-semibold text-success shrink-0"
                  >
                    Resolve
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-darklink">No reports against this post.</p>
        )}
      </div>

      {/* history */}
      <div>
        <h6 className="text-xs font-bold uppercase tracking-wide text-darklink mb-2">Enforcement history</h6>
        {history.length ? (
          <div className="flex flex-col gap-2.5 pl-1">
            {history.slice(0, 10).map((h) => (
              <div key={h.uuid} className="flex items-start gap-2.5">
                <span className={`size-6 rounded-md grid place-items-center shrink-0 ${actionTone(h.action)}`}>
                  <Icon icon={actionIcon(h.action)} height={13} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium">
                    {actionLabel(h.action)}{" "}
                    <span className="text-[10px] text-darklink">· {h.scope}</span>
                  </p>
                  <p className="text-[11px] text-darklink truncate">
                    {h.reason || h.result} ·{" "}
                    {h.created_at ? formatDistanceToNow(new Date(h.created_at), { addSuffix: true }) : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-darklink">No enforcement actions yet.</p>
        )}
      </div>

      <ResolveReportModal
        reportId={modal?.id ?? null}
        action={modal?.action ?? "resolve"}
        onClose={() => setModal(null)}
        onDone={onActed}
      />
    </div>
  );
};

export default PostModerationPanel;
