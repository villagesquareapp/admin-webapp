"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Textarea } from "flowbite-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import SidePanel from "@/app/components/shared/SidePanel";
import { decideAppeal, type AppealFilter } from "@/app/api/appeals";

const STATUS_TONE: Record<IAppeal["status"], string> = {
  pending: "bg-lightwarning text-warning",
  upheld: "bg-lighterror text-error",
  overturned: "bg-lightsuccess text-success",
};
const STATUS_LABEL: Record<IAppeal["status"], string> = {
  pending: "Waiting",
  upheld: "Upheld",
  overturned: "Overturned",
};

const date = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";
const ago = (iso?: string | null) => (iso ? formatDistanceToNow(new Date(iso), { addSuffix: true }) : "");

const sanctionText = (a: IAppeal) =>
  a.sanction === "banned"
    ? "Permanently suspended"
    : `Suspended${a.suspended_until ? ` until ${date(a.suspended_until)}` : ""}`;

const Avatar = ({ user }: { user: IAppeal["user"] }) =>
  user.profile_picture ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={user.profile_picture} alt="" className="size-10 rounded-full object-cover shrink-0" />
  ) : (
    <span className="size-10 rounded-full bg-lightprimary text-primary grid place-items-center font-semibold shrink-0">
      {(user.name || user.username || "?").charAt(0).toUpperCase()}
    </span>
  );

const AppealsQueue = ({ page, status }: { page: IAppealsPage; status: AppealFilter }) => {
  const [open, setOpen] = useState<IAppeal | null>(null);
  const rows = page.data;

  return (
    <>
      <CardBox className="p-0">
        {rows.length === 0 ? (
          <div className="py-16 text-center text-darklink">
            <Icon icon="solar:inbox-line-linear" height={36} className="mx-auto mb-3" />
            <p>{status === "pending" ? "No appeals waiting." : "No appeals here yet."}</p>
          </div>
        ) : (
          <ul className="divide-y divide-border dark:divide-darkborder">
            {rows.map((a) => (
              <li key={a.uuid}>
                <button
                  onClick={() => setOpen(a)}
                  className="w-full text-left flex items-start gap-3 px-5 py-4 hover:bg-lightgray dark:hover:bg-white/5"
                >
                  <Avatar user={a.user} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-semibold truncate">{a.user.name}</span>
                      <span className="text-xs text-darklink">@{a.user.username}</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_TONE[a.status]}`}>
                        {STATUS_LABEL[a.status]}
                      </span>
                    </div>
                    <p className="text-xs text-darklink mt-0.5">
                      {sanctionText(a)}
                      {a.reason?.label ? ` · ${a.reason.label}` : ""}
                    </p>
                    <p className="text-sm mt-1.5 line-clamp-2">{a.message}</p>
                  </div>
                  <span className="text-[11px] text-darklink shrink-0">{ago(a.created_at)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardBox>

      {page.last_page > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <span className="text-darklink me-2">
            Page {page.current_page} of {page.last_page}
          </span>
          {page.current_page > 1 && (
            <Link href={`?status=${status}&page=${page.current_page - 1}`} className="px-3 py-1.5 rounded-md border border-ld">
              Previous
            </Link>
          )}
          {page.current_page < page.last_page && (
            <Link href={`?status=${status}&page=${page.current_page + 1}`} className="px-3 py-1.5 rounded-md border border-ld">
              Next
            </Link>
          )}
        </div>
      )}

      <SidePanel
        open={!!open}
        onClose={() => setOpen(null)}
        icon="solar:shield-user-linear"
        title={open ? `Appeal from ${open.user.name}` : "Appeal"}
        subtitle={open ? `@${open.user.username} · sent ${ago(open.created_at)}` : undefined}
      >
        {open && <AppealDetail appeal={open} onDecided={() => setOpen(null)} />}
      </SidePanel>
    </>
  );
};

const AppealDetail = ({ appeal, onDecided }: { appeal: IAppeal; onDecided: () => void }) => {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<"uphold" | "overturn" | null>(null);
  const [confirming, setConfirming] = useState<"uphold" | "overturn" | null>(null);

  const decide = async (decision: "uphold" | "overturn") => {
    setBusy(decision);
    try {
      const res = await decideAppeal(appeal.uuid, decision, note);
      if (res?.status) {
        toast.success(decision === "overturn" ? "Appeal overturned: the account is active again" : "Appeal upheld");
        onDecided();
        router.refresh();
      } else {
        toast.error(res?.message || "The appeal couldn't be decided");
      }
    } finally {
      setBusy(null);
      setConfirming(null);
    }
  };

  const fact = (label: string, value: React.ReactNode) => (
    <div className="rounded-xl border border-border dark:border-darkborder p-3">
      <p className="text-[11px] text-darklink">{label}</p>
      <div className="text-sm font-medium mt-1">{value}</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[11px] font-semibold text-darklink uppercase tracking-wide mb-2">What they wrote</p>
        <p className="text-sm whitespace-pre-wrap rounded-xl bg-lightgray dark:bg-white/5 p-4">{appeal.message}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {fact("Decision appealed", sanctionText(appeal))}
        {fact("Decided on", date(appeal.sanction_at))}
        {fact("Guideline they were shown", appeal.reason?.label ?? <span className="text-darklink">None given</span>)}
        {fact("Account now", <span className="capitalize">{appeal.user.status.replace(/_/g, " ")}</span>)}
      </div>

      {appeal.staff_reason && (
        <p className="text-xs text-darklink">
          Staff note on the suspension: <span className="text-ink dark:text-white">{appeal.staff_reason}</span>
        </p>
      )}

      <Link
        href={`/dashboards/users/${appeal.user.uuid}`}
        className="text-sm font-semibold text-primary inline-flex items-center gap-1"
      >
        Open their account, reports and history
        <Icon icon="solar:arrow-right-linear" height={16} />
      </Link>

      {appeal.status === "pending" ? (
        <div className="flex flex-col gap-3 border-t border-ld pt-5">
          <label className="text-[11px] font-semibold text-darklink uppercase tracking-wide" htmlFor="appeal-note">
            Your note (staff only)
          </label>
          <Textarea
            id="appeal-note"
            rows={3}
            maxLength={1000}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Why you decided this. They never see it."
          />
          {confirming ? (
            <div className="rounded-xl border border-ld p-4 flex flex-col gap-3">
              <p className="text-sm">
                {confirming === "overturn"
                  ? `Lift the ${appeal.sanction === "banned" ? "ban" : "suspension"} on @${appeal.user.username}? They can sign in again straight away, and we'll email them.`
                  : `Keep the ${appeal.sanction === "banned" ? "ban" : "suspension"}? We'll email @${appeal.user.username} that the decision stands.`}
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setConfirming(null)}
                  disabled={!!busy}
                  className="text-sm font-semibold px-4 py-2 rounded-md border border-ld"
                >
                  Back
                </button>
                <button
                  onClick={() => decide(confirming)}
                  disabled={!!busy}
                  className={`text-sm font-semibold px-4 py-2 rounded-md text-white disabled:opacity-50 ${
                    confirming === "overturn" ? "bg-success" : "bg-error"
                  }`}
                >
                  {busy ? "Saving…" : confirming === "overturn" ? "Lift it" : "Keep it"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setConfirming("uphold")}
                className="flex-1 text-sm font-semibold px-4 py-2.5 rounded-md border border-error text-error hover:bg-lighterror"
              >
                Uphold
              </button>
              <button
                onClick={() => setConfirming("overturn")}
                className="flex-1 text-sm font-semibold px-4 py-2.5 rounded-md bg-success text-white hover:opacity-90"
              >
                Overturn
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="border-t border-ld pt-5 text-sm">
          <p>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_TONE[appeal.status]}`}>
              {STATUS_LABEL[appeal.status]}
            </span>{" "}
            by {appeal.decided_by_name ?? "staff"} {ago(appeal.decided_at)}
          </p>
          {appeal.decision_note && <p className="text-darklink mt-2">Note: {appeal.decision_note}</p>}
        </div>
      )}
    </div>
  );
};

export default AppealsQueue;
