"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Badge, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner, Textarea } from "flowbite-react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import { Button } from "@/app/components/shared/Button";
import { releaseReportReview, reopenReport, startReportReview } from "@/app/api/report";

const noSubscribe = () => () => {};
const When = ({ value }: { value?: string | null }) => {
  const inBrowser = useSyncExternalStore(noSubscribe, () => true, () => false);
  if (!value) return null;
  return <time dateTime={value}>{inBrowser ? new Date(value).toLocaleString() : ""}</time>;
};

const STATUS_COLOR: Record<string, string> = {
  open: "warning",
  in_review: "info",
  resolved: "success",
  dismissed: "gray",
};

const STEP: Record<string, { label: string; icon: string; tone: string }> = {
  report_review_started: { label: "Took it for review", icon: "solar:eye-linear", tone: "bg-lightinfo text-info" },
  report_review_released: { label: "Put it back in the queue", icon: "solar:undo-left-linear", tone: "bg-lightgray dark:bg-dark text-darklink" },
  report_dismissed: { label: "Dismissed it", icon: "solar:close-circle-linear", tone: "bg-lightgray dark:bg-dark text-darklink" },
  report_reopened: { label: "Reopened it", icon: "solar:restart-linear", tone: "bg-lightwarning text-warning" },
  report_resolved: { label: "Resolved it", icon: "solar:check-circle-linear", tone: "bg-lightsuccess text-success" },
};

// Moderation actions, as they read in a history or an account's record.
export const ACTION_LABEL: Record<string, string> = {
  remove_content: "Removed the content",
  restore_content: "Restored the content",
  limit_visibility: "Hid the content",
  unfeature_content: "Unfeatured the content",
  warn_user: "Warned the account",
  strike_user: "Gave the account a strike",
  restrict_user: "Restricted the account",
  suspend_user: "Suspended the account",
  shadowban_user: "Shadow-hid the account",
  ban_user: "Banned the account",
  reinstate_user: "Reinstated the account",
  force_logout: "Signed the account out",
};

const methods = (m: unknown) =>
  Array.isArray(m) && m.length ? m.map((x) => String(x).replace(/_/g, " ")).join(", ") : null;

// Start review / stop / reopen, beside Resolve and Dismiss.
export const ReviewButtons = ({ report }: { report: IReportDetail }) => {
  const router = useRouter();
  const me = useSession().data?.user?.id;
  const [busy, setBusy] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [why, setWhy] = useState("");

  const run = async (fn: () => Promise<{ status: boolean; message?: string } | null>, done: string) => {
    setBusy(true);
    try {
      const res = await fn();
      if (res?.status) {
        toast.success(done);
        router.refresh();
        return true;
      }
      toast.error(res?.message || "Something went wrong");
      return false;
    } finally {
      setBusy(false);
    }
  };

  if (report.status === "open") {
    return (
      <Button color="primary" disabled={busy} onClick={() => run(() => startReportReview(report.id), "You're reviewing this report")}>
        {busy && <Spinner size="sm" light className="me-2" />}
        Start review
      </Button>
    );
  }
  if (report.status === "in_review") {
    return (
      <>
        {report.handled_by !== me && (
          <Button color="light" disabled={busy} onClick={() => run(() => startReportReview(report.id), "You're reviewing this report")}>
            Take it over
          </Button>
        )}
        <Button color="light" disabled={busy} onClick={() => run(() => releaseReportReview(report.id), "Back in the open queue")}>
          Stop reviewing
        </Button>
      </>
    );
  }
  if (report.status !== "dismissed") return null;
  return (
    <>
      <Button color="light" onClick={() => setReopening(true)}>
        <Icon icon="solar:restart-linear" height={16} className="me-1" />
        Reopen
      </Button>
      <Modal show={reopening} onClose={() => setReopening(false)} size="md">
        <ModalHeader>Reopen this report?</ModalHeader>
        <ModalBody>
          <p className="text-sm text-darklink mb-3">It goes back to the open queue. The dismissal stays in its history.</p>
          <Label htmlFor="reopen-why">Why (optional)</Label>
          <Textarea id="reopen-why" rows={3} maxLength={500} value={why} onChange={(e) => setWhy(e.target.value)} />
        </ModalBody>
        <ModalFooter className="justify-end">
          <Button color="light" onClick={() => setReopening(false)}>
            Cancel
          </Button>
          <Button
            color="primary"
            disabled={busy}
            onClick={async () => {
              if (await run(() => reopenReport(report.id, why.trim()), "Report reopened")) {
                setReopening(false);
                setWhy("");
              }
            }}
          >
            {busy && <Spinner size="sm" light className="me-2" />}
            Reopen
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

// Who is on it now: the last person who took it for review.
export const reviewerName = (report: IReportDetail) =>
  [...(report.history ?? [])].reverse().find((h) => h.action === "report_review_started")?.admin_name ?? null;

export const History = ({ report }: { report: IReportDetail }) => {
  const steps = report.history ?? [];
  return (
    <CardBox>
      <h5 className="font-semibold mb-4">History</h5>
      <ol className="relative border-s border-ld ms-3 flex flex-col gap-4">
        <li className="ms-5">
          <span className="absolute -start-3 size-6 rounded-full grid place-items-center bg-lightwarning text-warning">
            <Icon icon="solar:flag-linear" height={13} />
          </span>
          <p className="text-sm">
            Reported by <span className="font-semibold">{report.reporter?.name || "someone"}</span>
          </p>
          <p className="text-xs text-darklink">
            <When value={report.created_at} />
          </p>
        </li>
        {steps.map((h) => {
          const step = STEP[h.action];
          const label = step?.label ?? ACTION_LABEL[h.action] ?? h.action.replace(/_/g, " ");
          const failed = h.result && h.result !== "executed";
          const detail =
            h.action === "report_resolved"
              ? methods(h.metadata?.resolution_methods) ?? (h.metadata?.resolved_with_report ? "Closed with another report on the same item" : null)
              : h.action === "report_review_started" && h.metadata?.taken_over_from
                ? "Took it over from someone else"
                : null;
          return (
            <li key={h.uuid} className="ms-5">
              <span
                className={`absolute -start-3 size-6 rounded-full grid place-items-center ${
                  failed ? "bg-lighterror text-error" : step?.tone ?? "bg-lightprimary text-primary"
                }`}
              >
                <Icon icon={failed ? "solar:danger-triangle-linear" : step?.icon ?? "solar:shield-check-linear"} height={13} />
              </span>
              <p className="text-sm">
                <span className="font-semibold">{h.admin_name || "Staff"}</span> {label.charAt(0).toLowerCase() + label.slice(1)}
                {failed && <span className="text-error"> (didn&apos;t work: {h.result})</span>}
              </p>
              {detail && <p className="text-xs text-darklink">{detail}</p>}
              {h.reason && <p className="text-xs text-darklink whitespace-pre-line">&ldquo;{h.reason}&rdquo;</p>}
              <p className="text-xs text-darklink">
                <When value={h.created_at} />
              </p>
            </li>
          );
        })}
      </ol>
    </CardBox>
  );
};

export const RelatedReports = ({ report }: { report: IReportDetail }) => {
  const related = report.related;
  if (!related?.total) return null;
  return (
    <CardBox>
      <div className="flex items-center justify-between mb-3">
        <h5 className="font-semibold">Other reports on this {report.report_service_type}</h5>
        <span className="text-xs text-darklink">
          {related.total} in all{related.open ? ` · ${related.open} open` : ""}
        </span>
      </div>
      {related.open > 0 && (report.status === "open" || report.status === "in_review") && (
        <p className="text-xs text-darklink mb-3">Resolving this report closes the open ones with it.</p>
      )}
      <ul className="flex flex-col divide-y divide-border dark:divide-darkborder">
        {related.items.map((r) => (
          <li key={r.id} className="py-2.5">
            <Link href={`/dashboards/reports/${r.id}`} className="flex items-start justify-between gap-3 hover:opacity-80">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{r.reason_title || r.reason || "Something else"}</p>
                {r.reason && r.reason_title && <p className="text-xs text-darklink truncate">{r.reason}</p>}
                <p className="text-xs text-darklink">
                  {r.reporter_username ? `@${r.reporter_username}` : "Unknown"} · <When value={r.created_at} />
                </p>
              </div>
              <Badge color={STATUS_COLOR[r.status] ?? "gray"} className="capitalize shrink-0">
                {r.status.replace(/_/g, " ")}
              </Badge>
            </Link>
          </li>
        ))}
      </ul>
      {related.total > related.items.length && (
        <p className="text-xs text-darklink mt-2">Showing the latest {related.items.length}.</p>
      )}
    </CardBox>
  );
};

// The reporter's track record and the reported account's past enforcement.
export const Records = ({ report }: { report: IReportDetail }) => {
  const rep = report.reporter_record;
  const owner = report.owner_record;
  const mostlyDismissed = !!rep && rep.total >= 5 && rep.dismissed / rep.total >= 0.7;
  if (!rep && !owner) return null;
  return (
    <CardBox>
      <h5 className="font-semibold mb-3">Records</h5>
      <div className="flex flex-col gap-4 text-sm">
        {rep && (
          <div>
            <p className="text-xs text-darklink mb-1">The reporter</p>
            <p>
              {rep.total} report{rep.total === 1 ? "" : "s"} made · {rep.resolved} acted on · {rep.dismissed} dismissed
              {rep.open ? ` · ${rep.open} open` : ""}
            </p>
            {mostlyDismissed && (
              <p className="text-xs text-warning mt-1">Most of their reports are dismissed. They may be reporting in bad faith.</p>
            )}
          </div>
        )}
        {owner && (
          <div>
            <p className="text-xs text-darklink mb-1">
              {report.report_service_type === "user" ? "The reported account" : "The author's account"}
            </p>
            <p>
              {owner.enforcement_count} past action{owner.enforcement_count === 1 ? "" : "s"} · {owner.account_reports_count} report
              {owner.account_reports_count === 1 ? "" : "s"} about the account
            </p>
            {owner.recent_enforcement.length > 0 && (
              <ul className="mt-2 flex flex-col gap-1.5">
                {owner.recent_enforcement.map((a) => (
                  <li key={a.uuid} className="text-xs text-darklink">
                    <span className="text-dark dark:text-white font-medium">{ACTION_LABEL[a.action] ?? a.action}</span>
                    {a.admin_name ? ` by ${a.admin_name}` : ""} · <When value={a.created_at} />
                    {a.reason && <span className="block">&ldquo;{a.reason}&rdquo;</span>}
                  </li>
                ))}
              </ul>
            )}
            <Link href={`/dashboards/users/${owner.user_id}`} className="text-xs text-primary font-semibold mt-2 inline-block">
              Open the account →
            </Link>
          </div>
        )}
      </div>
    </CardBox>
  );
};

