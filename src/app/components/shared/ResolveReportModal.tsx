"use client";

import { useState } from "react";
import { Label, Modal, ModalBody, ModalFooter, ModalHeader, Radio, Select, Textarea, Spinner } from "flowbite-react";
import { Button } from "@/app/components/shared/Button";
import { toast } from "sonner";
import { resolveReport, dismissReport } from "@/app/api/report";

export type ReportAction = "resolve" | "dismiss";

type ContentChoice = "none" | "content_removed" | "visibility_limited";
type AccountChoice = "none" | "user_warned" | "account_restricted" | "user_suspended" | "user_banned";

// What each reported thing supports. Hiding exists only where content can be
// hidden without being removed; account actions need an owner (a Trybe has
// none, and dating reports aren't wired to one yet).
const CAN_REMOVE = ["post", "vflix", "echo", "livestream", "marketsquare", "africa-talent-challenge", "trybe"];
const CAN_HIDE = ["post", "vflix"];
const NO_ACCOUNT = ["trybe", "dating"];

const REMOVE_HINT: Record<string, string> = {
  post: "Removed for everyone, with the rest of the author's own thread.",
  vflix: "Removed for everyone.",
  echo: "Ends the room if it's live and removes it for everyone.",
  livestream: "Ends the stream if it's live and removes its replay.",
  marketsquare: "Takes the listing down.",
  "africa-talent-challenge": "Takes the application down.",
  trybe: "Suspends the Trybe; its live rooms end.",
};

const ACCOUNT_OPTIONS: { value: AccountChoice; label: string; hint: string; timed?: boolean }[] = [
  { value: "none", label: "No action on the account", hint: "" },
  { value: "user_warned", label: "Warn", hint: "They get a warning notice." },
  {
    value: "account_restricted",
    label: "Restrict",
    hint: "They can browse and message, but can't post, comment, upload or go live.",
    timed: true,
  },
  { value: "user_suspended", label: "Suspend", hint: "Signed out and can't use the app.", timed: true },
  { value: "user_banned", label: "Ban", hint: "Signed out for good." },
];

const DURATIONS = [1, 3, 7, 14, 30];

const ACTION_LABEL: Record<string, string> = {
  remove_content: "remove it",
  limit_visibility: "hide it",
  warn_user: "warn the user",
  suspend_user: "suspend the user",
  ban_user: "ban the user",
  restrict_user: "restrict the account",
};
const ALREADY: Record<string, string> = {
  remove_content: "it was already removed",
  limit_visibility: "it was already hidden",
};

/**
 * Generic report resolve/dismiss modal, reusable across every report type.
 * `reportId` non-null opens it; `serviceType` (the report's type) decides which
 * outcomes are offered. On success `onDone(id, status)` lets the caller update
 * its list/detail in place.
 */
const ResolveReportModal = ({
  reportId,
  action,
  serviceType,
  onClose,
  onDone,
}: {
  reportId: string | null;
  action: ReportAction;
  serviceType?: string;
  onClose: () => void;
  onDone?: (id: string, status: "resolved" | "dismissed") => void;
}) => {
  const [content, setContent] = useState<ContentChoice>("none");
  const [account, setAccount] = useState<AccountChoice>("none");
  const [days, setDays] = useState(7);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const type = serviceType ?? "";
  const canRemove = !serviceType || CAN_REMOVE.includes(type);
  const canHide = !serviceType || CAN_HIDE.includes(type);
  const hasAccount = !NO_ACCOUNT.includes(type);
  const timed = ACCOUNT_OPTIONS.find((o) => o.value === account)?.timed;

  const reset = () => {
    setContent("none");
    setAccount("none");
    setDays(7);
    setNote("");
  };
  const close = () => {
    reset();
    onClose();
  };

  const submit = async () => {
    if (!reportId) return;
    if (action === "dismiss" && note.trim().length < 10)
      return toast.error("Dismissal reason must be at least 10 characters");
    if (note.trim().length > 500) return toast.error("Keep it under 500 characters");

    const methods = [content, account].filter((m) => m !== "none");
    setLoading(true);
    try {
      const res =
        action === "resolve"
          ? await resolveReport(
              reportId,
              note.trim(),
              methods.length ? methods : ["other"],
              timed ? days : undefined
            )
          : await dismissReport(reportId, note.trim());
      if (res?.status) {
        const out = action === "resolve" ? (res.data as IReportResolveResult | undefined) : undefined;
        const results = out?.results ?? [];
        const missed = results
          .filter((r) => r.result === "failed" || r.result === "unsupported")
          .map((r) => ACTION_LABEL[r.action] || r.action.replace(/_/g, " "));
        const already = results.filter((r) => r.result === "unchanged").map((r) => ALREADY[r.action]).filter(Boolean);
        const closed = out?.reports_closed ?? 1;
        const done =
          action === "resolve"
            ? `Report resolved${closed > 1 ? ` with ${closed - 1} other report${closed > 2 ? "s" : ""} on it` : ""}`
            : "Report dismissed";
        if (missed.length) toast.warning(`${done}, but we couldn't ${missed.join(", ")}.`);
        else if (already.length) toast.info(`${done}; ${already.join(", ")}.`);
        else toast.success(done);
        onDone?.(reportId, action === "resolve" ? "resolved" : "dismissed");
        close();
      } else {
        toast.error(res?.message || "Failed to update report");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const option = (
    group: string,
    checked: boolean,
    onSelect: () => void,
    label: string,
    hint?: string,
    extra?: React.ReactNode
  ) => (
    <label className="flex items-start gap-2 text-sm cursor-pointer">
      <Radio name={group} checked={checked} onChange={onSelect} className="mt-0.5" />
      <span className="flex-1">
        <span className="font-medium">{label}</span>
        {hint && <span className="block text-xs text-darklink">{hint}</span>}
        {extra}
      </span>
    </label>
  );

  return (
    <Modal show={!!reportId} onClose={close} size="md">
      <ModalHeader>{action === "resolve" ? "Resolve report" : "Dismiss report"}</ModalHeader>
      <ModalBody>
        <div className="flex flex-col gap-5">
          {action === "resolve" ? (
            <>
              {(canRemove || canHide) && (
                <div className="flex flex-col gap-2">
                  <Label>The reported content</Label>
                  {option("content", content === "none", () => setContent("none"), "Leave it up")}
                  {canRemove &&
                    option(
                      "content",
                      content === "content_removed",
                      () => setContent("content_removed"),
                      type === "trybe" ? "Suspend it" : "Remove it",
                      REMOVE_HINT[type] ?? "Removed for everyone."
                    )}
                  {canHide &&
                    option(
                      "content",
                      content === "visibility_limited",
                      () => setContent("visibility_limited"),
                      "Hide it from everyone but the author",
                      "It stays on their profile for them; nobody else sees it anywhere."
                    )}
                </div>
              )}
              {hasAccount && (
                <div className="flex flex-col gap-2">
                  <Label>{type === "user" ? "The reported account" : "The author's account"}</Label>
                  {ACCOUNT_OPTIONS.map((o) =>
                    option(
                      "account",
                      account === o.value,
                      () => setAccount(o.value),
                      o.label,
                      o.hint,
                      o.timed && account === o.value ? (
                        <Select
                          sizing="sm"
                          className="mt-2 w-36"
                          value={days}
                          onChange={(e) => setDays(Number(e.target.value))}
                        >
                          {DURATIONS.map((d) => (
                            <option key={d} value={d}>
                              {d === 1 ? "1 day" : `${d} days`}
                            </option>
                          ))}
                        </Select>
                      ) : undefined
                    )
                  )}
                </div>
              )}
              <p className="text-xs text-darklink">
                Other open reports about the same thing close too. Whoever reported it is told it was reviewed and acted
                on; the account owner is told what happened and the report's reason, never your note.
              </p>
            </>
          ) : (
            <p className="text-sm text-darklink">
              Dismiss this report as no violation. This closes the report without action, and the reporter is told we
              didn&apos;t find a violation.
            </p>
          )}
          <div>
            <Label>{action === "resolve" ? "Internal note (optional)" : "Reason (required, staff only)"}</Label>
            <Textarea
              className="mt-2"
              rows={3}
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                action === "resolve"
                  ? "Only staff see this (audit trail)…"
                  : "Why is this being dismissed? (min 10 characters)"
              }
            />
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="gray" onClick={close} disabled={loading}>
          Cancel
        </Button>
        <Button
          color={action === "resolve" ? "success" : "warning"}
          onClick={submit}
          disabled={loading}
        >
          {loading && <Spinner size="sm" light />}
          {action === "resolve" ? "Resolve report" : "Dismiss report"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ResolveReportModal;
