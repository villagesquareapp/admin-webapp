"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { executeModeration } from "@/app/api/moderation";

interface Props {
  // What moderation calls it: "post" (replies are posts) or "vflix_comment".
  serviceType: string;
  targetId: string;
  removed: boolean;
  onChange: (removed: boolean) => void;
}

// Remove (with an optional reason) or restore one reply or comment in place.
const RemoveRestore = ({ serviceType, targetId, removed, onChange }: Props) => {
  const [asking, setAsking] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (restore: boolean) => {
    setBusy(true);
    try {
      const res = await executeModeration({
        service_type: serviceType,
        target_id: targetId,
        actions: [{ action: restore ? "restore_content" : "remove_content" }],
        reason: reason.trim() || undefined,
      });
      const result = (res?.data as { result?: string }[] | undefined)?.[0]?.result;
      if (res?.status && result === "executed") {
        toast.success(restore ? "Restored" : "Removed");
        onChange(!restore);
      } else if (result === "unchanged") {
        toast.info(restore ? "It wasn't removed" : "It was already removed");
        onChange(!restore);
      } else {
        toast.error(res?.message || "That didn't work. Try again.");
      }
    } catch {
      toast.error("That didn't work. Try again.");
    } finally {
      setBusy(false);
      setAsking(false);
      setReason("");
    }
  };

  if (removed) {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={() => run(true)}
        className="flex items-center gap-1 text-xs font-semibold text-success hover:underline disabled:opacity-60"
      >
        <Icon icon={busy ? "svg-spinners:180-ring" : "solar:restart-linear"} height={14} /> Restore
      </button>
    );
  }

  if (!asking) {
    return (
      <button
        type="button"
        onClick={() => setAsking(true)}
        className="flex items-center gap-1 text-xs font-semibold text-error hover:underline"
      >
        <Icon icon="solar:trash-bin-minimalistic-linear" height={14} /> Remove
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 w-full">
      <input
        autoFocus
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && run(false)}
        placeholder="Reason (optional)"
        maxLength={200}
        className="flex-1 min-w-0 text-xs rounded-md border border-ld bg-transparent px-2 py-1 focus:outline-none focus:border-primary"
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => run(false)}
        className="text-xs font-semibold rounded-md bg-error text-white px-2.5 py-1 disabled:opacity-60"
      >
        {busy ? "Removing…" : "Remove"}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => setAsking(false)}
        className="text-xs font-semibold text-darklink px-1"
      >
        Cancel
      </button>
    </div>
  );
};

export default RemoveRestore;
