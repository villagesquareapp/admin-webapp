"use client";

import React, { useState } from "react";
import { Dropdown, DropdownItem, Modal, ModalBody, Spinner } from "flowbite-react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/shared/Button";
import {
  cancelPushNotification,
  deletePushNotification,
  resendPushNotification,
} from "@/app/api/push-notification";
import { audienceOf } from "./pushUi";

export type PushActionKind = "resend" | "cancel" | "delete";

const COPY: Record<PushActionKind, { title: string; text: string; cta: string; color: string; icon: string; tone: string; done: string }> = {
  resend: {
    title: "Send this push again?",
    text: "It goes out now, to the same audience.",
    cta: "Send again",
    color: "primary",
    icon: "solar:restart-bold-duotone",
    tone: "bg-lightprimary text-primary",
    done: "Push sent again",
  },
  cancel: {
    title: "Cancel this scheduled push?",
    text: "It won’t go out. You can duplicate it later if you change your mind.",
    cta: "Cancel push",
    color: "warning",
    icon: "solar:calendar-mark-bold-duotone",
    tone: "bg-lightwarning text-warning",
    done: "Scheduled push cancelled",
  },
  delete: {
    title: "Delete this push from the list?",
    text: "Phones that already got it keep it. The record stays in the staff log.",
    cta: "Delete",
    color: "failure",
    icon: "solar:trash-bin-trash-bold-duotone",
    tone: "bg-lighterror text-error",
    done: "Push deleted",
  },
};

const RUN: Record<PushActionKind, (id: string) => Promise<any>> = {
  resend: resendPushNotification,
  cancel: cancelPushNotification,
  delete: deletePushNotification,
};

export const ConfirmPushAction = ({
  notification,
  kind,
  onClose,
  onDone,
}: {
  notification: IPushNotifications;
  kind: PushActionKind | null;
  onClose: () => void;
  onDone?: (kind: PushActionKind) => void;
}) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const copy = kind ? COPY[kind] : null;
  const mass = audienceOf(notification) !== "users";

  const run = async () => {
    if (!kind) return;
    setBusy(true);
    try {
      const res = await RUN[kind](notification.uuid);
      if (res?.status) {
        toast.success(COPY[kind].done);
        onClose();
        onDone?.(kind);
        router.refresh();
      } else {
        toast.error(res?.message || "That didn’t work");
      }
    } catch (e: any) {
      toast.error(e?.message || "That didn’t work");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal show={!!kind} size="md" onClose={() => !busy && onClose()} popup className="z-[110]">
      <ModalBody>
        {copy && (
          <div className="text-center pt-6">
            <span className={`mx-auto mb-4 size-14 rounded-full grid place-items-center ${copy.tone}`}>
              <Icon icon={copy.icon} height={28} />
            </span>
            <h3 className="text-lg font-semibold">{copy.title}</h3>
            <p className="text-sm text-darklink mt-1.5">{copy.text}</p>
            {kind === "resend" && mass && (
              <p className="text-xs text-warning mt-2">This counts towards the 3 whole-audience pushes allowed in 24 hours.</p>
            )}
            <p className="text-sm font-medium mt-4 px-4 truncate">“{notification.title}”</p>
            <div className="flex justify-center gap-3 mt-6">
              <Button color="light" onClick={onClose} disabled={busy}>Keep it</Button>
              <Button color={copy.color} onClick={run} disabled={busy}>
                {busy && <Spinner size="sm" light />}
                {copy.cta}
              </Button>
            </div>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};

const Actions = ({
  notification,
  onView,
  onDuplicate,
}: {
  notification: IPushNotifications;
  onView: () => void;
  onDuplicate: () => void;
}) => {
  const [kind, setKind] = useState<PushActionKind | null>(null);
  const s = notification.status;

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Dropdown
        label=""
        inline
        placement="bottom-end"
        renderTrigger={() => (
          <button className="p-2 rounded-full text-darklink hover:bg-lightprimary hover:text-primary transition-colors" aria-label="Actions">
            <Icon icon="solar:menu-dots-bold" height={18} />
          </button>
        )}
      >
        <DropdownItem onClick={onView} icon={() => <Icon icon="solar:eye-linear" height={16} className="me-2" />}>View details</DropdownItem>
        <DropdownItem onClick={onDuplicate} icon={() => <Icon icon="solar:copy-linear" height={16} className="me-2" />}>Duplicate</DropdownItem>
        {s !== "scheduled" && s !== "sending" && (
          <DropdownItem onClick={() => setKind("resend")} icon={() => <Icon icon="solar:restart-linear" height={16} className="me-2" />}>Send again</DropdownItem>
        )}
        {s === "scheduled" && (
          <DropdownItem onClick={() => setKind("cancel")} icon={() => <Icon icon="solar:calendar-mark-linear" height={16} className="me-2" />}>Cancel schedule</DropdownItem>
        )}
        {s !== "sending" && (
          <DropdownItem onClick={() => setKind("delete")} className="text-error" icon={() => <Icon icon="solar:trash-bin-trash-linear" height={16} className="me-2" />}>Delete</DropdownItem>
        )}
      </Dropdown>
      <ConfirmPushAction notification={notification} kind={kind} onClose={() => setKind(null)} />
    </div>
  );
};

export default Actions;
