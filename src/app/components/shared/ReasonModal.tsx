"use client";

import { useEffect, useState } from "react";
import { Modal, ModalBody, Spinner, Textarea } from "flowbite-react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/app/components/shared/Button";

const TONE: Record<string, string> = {
  failure: "bg-lighterror text-error",
  warning: "bg-lightwarning text-warning",
  primary: "bg-lightprimary text-primary",
  success: "bg-lightsuccess text-success",
};

// A confirmation that asks why: the reason goes to the staff log with the
// action. onConfirm returns false to keep the dialog open.
const ReasonModal = ({
  open,
  title,
  text,
  subject,
  confirmLabel,
  color = "failure",
  icon = "solar:danger-triangle-bold-duotone",
  placeholder = "Why? This goes in the staff log.",
  needsReason = true,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  text?: React.ReactNode;
  subject?: string;
  confirmLabel: string;
  color?: "failure" | "warning" | "primary" | "success";
  icon?: string;
  placeholder?: string;
  needsReason?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<boolean | void>;
}) => {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  const submit = async () => {
    if (needsReason && reason.trim().length < 3) {
      toast.error("Add a short reason");
      return;
    }
    setBusy(true);
    try {
      const keepOpen = (await onConfirm(reason.trim())) === false;
      if (!keepOpen) onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal show={open} size="md" onClose={() => !busy && onClose()} popup className="z-[110]">
      <ModalBody>
        <div className="pt-6 text-center">
          <span className={`mx-auto mb-4 size-14 rounded-full grid place-items-center ${TONE[color]}`}>
            <Icon icon={icon} height={28} />
          </span>
          <h3 className="text-lg font-semibold">{title}</h3>
          {text && <p className="text-sm text-darklink mt-1.5">{text}</p>}
          {subject && <p className="text-sm font-medium mt-3 px-4 truncate">“{subject}”</p>}
        </div>
        {needsReason && (
          <div className="mt-5">
            <Textarea
              rows={3}
              value={reason}
              maxLength={500}
              placeholder={placeholder}
              onChange={(e) => setReason(e.target.value)}
              disabled={busy}
            />
            <p className="text-right text-[11px] text-darklink mt-1">{reason.length}/500</p>
          </div>
        )}
        <div className="flex justify-center gap-3 mt-5">
          <Button color="light" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button color={color} onClick={submit} disabled={busy}>
            {busy && <Spinner size="sm" light />}
            {confirmLabel}
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ReasonModal;
