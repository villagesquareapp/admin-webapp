"use client";

import { useState } from "react";
import { Button, Label, Modal, Select, Textarea, TextInput } from "flowbite-react";
import { toast } from "sonner";
import { executeModeration } from "@/app/api/moderation";

const USER_ACTIONS: { value: string; label: string }[] = [
  { value: "warn_user", label: "Warn user" },
  { value: "strike_user", label: "Add a strike" },
  { value: "restrict_user", label: "Restrict account" },
  { value: "suspend_user", label: "Suspend (temporary)" },
  { value: "shadowban_user", label: "Shadowban (limit reach)" },
  { value: "ban_user", label: "Ban (permanent)" },
  { value: "reinstate_user", label: "Reinstate / unban" },
  { value: "force_logout", label: "Force logout (all devices)" },
];

/** Generic direct user-moderation modal (uses the enforcement engine). */
const ModerateUserModal = ({
  userId,
  open,
  onClose,
  onDone,
}: {
  userId: string | null;
  open: boolean;
  onClose: () => void;
  onDone?: () => void;
}) => {
  const [action, setAction] = useState("");
  const [reason, setReason] = useState("");
  const [days, setDays] = useState("7");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setAction("");
    setReason("");
    setDays("7");
  };
  const close = () => {
    reset();
    onClose();
  };

  const submit = async () => {
    if (!userId) return;
    if (!action) return toast.error("Select an action");
    setLoading(true);
    try {
      const params = action === "suspend_user" ? { duration_days: Number(days) || 7 } : undefined;
      const res = await executeModeration({
        service_type: "user",
        target_id: userId,
        actions: [{ action, params }],
        reason: reason.trim() || undefined,
      });
      if (res?.status) {
        toast.success("Moderation action applied");
        onDone?.();
        close();
      } else {
        toast.error(res?.message || "Failed to apply action");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={open} onClose={close} size="md">
      <Modal.Header>Moderate user</Modal.Header>
      <Modal.Body>
        <div className="flex flex-col gap-4">
          <div>
            <Label value="Action" />
            <Select className="mt-2" value={action} onChange={(e) => setAction(e.target.value)} required>
              <option value="">Select an action</option>
              {USER_ACTIONS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </Select>
          </div>
          {action === "suspend_user" && (
            <div>
              <Label value="Duration (days)" />
              <TextInput
                className="mt-2"
                type="number"
                min={1}
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />
            </div>
          )}
          <div>
            <Label value="Reason (optional)" />
            <Textarea
              className="mt-2"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Context for the audit trail…"
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button color="gray" onClick={close} disabled={loading}>
          Cancel
        </Button>
        <Button color="failure" onClick={submit} isProcessing={loading} disabled={loading}>
          Apply
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModerateUserModal;
