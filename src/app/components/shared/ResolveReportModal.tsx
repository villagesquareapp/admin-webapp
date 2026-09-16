"use client";

import { useState } from "react";
import { Button, Checkbox, Label, Modal, Textarea } from "flowbite-react";
import { toast } from "sonner";
import { resolveReport, dismissReport } from "@/app/api/report";

export type ReportAction = "resolve" | "dismiss";

// Generic resolution outcomes — apply to any report type (user/post/vflix/…).
const METHODS: { value: string; label: string }[] = [
  { value: "content_removed", label: "Content removed" },
  { value: "content_edited", label: "Content edited" },
  { value: "user_warned", label: "User warned" },
  { value: "user_suspended", label: "User suspended" },
  { value: "user_banned", label: "User banned" },
  { value: "account_restricted", label: "Account restricted" },
  { value: "other", label: "Other" },
];

/**
 * Generic report resolve/dismiss modal, reusable across every report type.
 * `reportId` non-null opens it; on success `onDone(id, status)` lets the caller
 * update its list/detail in place.
 */
const ResolveReportModal = ({
  reportId,
  action,
  onClose,
  onDone,
}: {
  reportId: string | null;
  action: ReportAction;
  onClose: () => void;
  onDone?: (id: string, status: "resolved" | "dismissed") => void;
}) => {
  const [methods, setMethods] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setMethods([]);
    setNote("");
  };
  const close = () => {
    reset();
    onClose();
  };
  const toggle = (m: string) =>
    setMethods((p) => (p.includes(m) ? p.filter((x) => x !== m) : [...p, m]));

  const submit = async () => {
    if (!reportId) return;
    if (action === "resolve" && methods.length === 0)
      return toast.error("Select at least one resolution outcome");
    if (action === "dismiss" && note.trim().length < 10)
      return toast.error("Dismissal reason must be at least 10 characters");

    setLoading(true);
    try {
      const res =
        action === "resolve"
          ? await resolveReport(
              reportId,
              note.trim() || `Resolved via: ${methods.join(", ")}`,
              methods
            )
          : await dismissReport(reportId, note.trim());
      if (res?.status) {
        toast.success(action === "resolve" ? "Report resolved" : "Report dismissed");
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

  return (
    <Modal show={!!reportId} onClose={close} size="md">
      <Modal.Header>{action === "resolve" ? "Resolve report" : "Dismiss report"}</Modal.Header>
      <Modal.Body>
        <div className="flex flex-col gap-4">
          {action === "resolve" ? (
            <div>
              <Label value="What are you resolving to?" />
              <div className="grid grid-cols-2 gap-2 mt-2">
                {METHODS.map((m) => (
                  <label key={m.value} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={methods.includes(m.value)}
                      onChange={() => toggle(m.value)}
                    />
                    {m.label}
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-darklink">
              Dismiss this report as no violation. This closes the report without action.
            </p>
          )}
          <div>
            <Label value={action === "resolve" ? "Note (optional)" : "Reason (required)"} />
            <Textarea
              className="mt-2"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                action === "resolve"
                  ? "Add context for the audit trail…"
                  : "Why is this being dismissed? (min 10 characters)"
              }
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button color="gray" onClick={close} disabled={loading}>
          Cancel
        </Button>
        <Button
          color={action === "resolve" ? "success" : "warning"}
          onClick={submit}
          isProcessing={loading}
          disabled={loading}
        >
          {action === "resolve" ? "Resolve report" : "Dismiss report"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ResolveReportModal;
