"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Drawer, Spinner } from "flowbite-react";
import { Icon } from "@iconify/react";
import { Button } from "@/app/components/shared/Button";
import { getPushNotification } from "@/app/api/push-notification";
import PushPreview from "./PushPreview";
import { ConfirmPushAction, PushActionKind } from "./Actions";
import {
  audienceLabel,
  audienceOf,
  compact,
  formatDateTime,
  recipientIds,
  relative,
  segmentOf,
  STATUS_LABEL,
  STATUS_TONE,
} from "./pushUi";

const Fact = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="rounded-xl border border-ld px-3 py-2.5">
    <p className="text-[11px] text-darklink">{label}</p>
    <div className="text-sm font-semibold mt-0.5">{value}</div>
  </div>
);

const PushDetail = ({
  row,
  onClose,
  onDuplicate,
}: {
  row: IPushNotifications | null;
  onClose: () => void;
  onDuplicate: (detail: IPushDetail | IPushNotifications) => void;
}) => {
  const [detail, setDetail] = useState<IPushDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [kind, setKind] = useState<PushActionKind | null>(null);

  useEffect(() => {
    if (!row) return;
    let live = true;
    setDetail(null);
    setLoading(true);
    getPushNotification(row.uuid)
      .then((res) => live && setDetail(res?.data ?? null))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [row]);

  const n: IPushNotifications | IPushDetail | null = detail ?? row;
  const audience = n ? audienceOf(n) : "all";
  const ok = n?.success_count ?? null;
  const bad = n?.failure_count ?? null;
  const total = (ok ?? 0) + (bad ?? 0);
  const recipients = detail?.recipients ?? [];
  const recipientCount = n?.recipients_count ?? (n ? recipientIds(n).length : 0);
  const segment = n ? segmentOf(n) : null;

  return (
    <Drawer open={!!row} onClose={onClose} position="right" className="z-[100] dark:bg-darkgray w-full max-w-[460px] p-0">
      {n && (
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-ld">
            <div className="min-w-0">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_TONE[n.status] || ""}`}>
                {STATUS_LABEL[n.status] || n.status}
              </span>
              <h5 className="text-base font-semibold mt-2 break-words">{n.title}</h5>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full text-darklink hover:bg-lightgray dark:hover:bg-white/5" aria-label="Close">
              <Icon icon="solar:close-circle-linear" height={22} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
            <PushPreview title={n.title} body={n.body} imageUrl={n.image_url || undefined} />

            <div className="grid grid-cols-2 gap-2.5">
              <Fact label="Audience" value={audienceLabel(n)} />
              <Fact
                label={n.status === "scheduled" || n.status === "cancelled" ? "Scheduled for" : "Sent"}
                value={
                  <span>
                    {formatDateTime(n.status === "scheduled" || n.status === "cancelled" ? n.scheduled_at : n.sent_at ?? n.created_at)}
                    <span className="block text-[11px] font-normal text-darklink">
                      {relative(n.status === "scheduled" || n.status === "cancelled" ? n.scheduled_at : n.sent_at ?? n.created_at)}
                    </span>
                  </span>
                }
              />
              <Fact label="Sent by" value={n.sent_by_name || (n.sent_by ? "Staff" : "System")} />
              <Fact label="Created" value={formatDateTime(n.created_at)} />
            </div>

            <div className="rounded-xl border border-ld p-4">
              <p className="text-sm font-semibold mb-3">Delivery</p>
              {audience === "all" && (n.status === "sent" || n.status === "partial") ? (
                <p className="text-sm text-darklink">
                  Handed to Firebase for every subscribed device. A push to everyone goes out as one message, so there are no per-device counts.
                </p>
              ) : total > 0 ? (
                <>
                  <div className="h-2.5 rounded-full bg-lighterror overflow-hidden flex">
                    <div className="bg-success h-full" style={{ width: `${(100 * (ok ?? 0)) / total}%` }} />
                  </div>
                  <div className="flex justify-between text-xs mt-2">
                    <span className="text-success font-semibold">{compact(ok)} devices reached</span>
                    <span className="text-error font-semibold">{compact(bad)} refused</span>
                  </div>
                  {!!bad && (
                    <p className="text-[11px] text-darklink mt-2">Refusals are usually phones that uninstalled the app or turned notifications off.</p>
                  )}
                </>
              ) : n.status === "sending" ? (
                <p className="text-sm text-darklink flex items-center gap-2"><Spinner size="sm" /> Going out now…</p>
              ) : n.status === "scheduled" ? (
                <p className="text-sm text-darklink">Not sent yet.</p>
              ) : (
                <p className="text-sm text-darklink">No delivery results recorded for this push.</p>
              )}
              {n.error && (
                <div className="mt-3 rounded-lg bg-lighterror/60 dark:bg-lighterror/10 text-error text-xs px-3 py-2 flex gap-2">
                  <Icon icon="solar:danger-circle-bold" height={16} className="shrink-0" />
                  <span>{n.error}</span>
                </div>
              )}
            </div>

            {segment && (
              <div className="rounded-xl border border-ld p-4">
                <p className="text-sm font-semibold">{segment.label}</p>
                <p className="text-xs text-darklink mt-1">
                  {recipientCount ? `${recipientCount.toLocaleString()} people with a recent push token. ` : ""}
                  {n.status === "scheduled"
                    ? "Who gets it is worked out again when it goes out."
                    : "Sending it again works the segment out again, so it reaches whoever is in it then."}
                </p>
                <Link href="/dashboards/analytics/audience" className="text-xs font-semibold text-primary inline-flex items-center gap-0.5 mt-2">
                  See segments <Icon icon="solar:alt-arrow-right-linear" height={13} />
                </Link>
              </div>
            )}

            {audience === "users" && (
              <div className="rounded-xl border border-ld p-4">
                <p className="text-sm font-semibold mb-3">
                  Recipients <span className="text-darklink font-normal">({recipientCount})</span>
                </p>
                {loading ? (
                  <div className="flex justify-center py-3"><Spinner size="sm" /></div>
                ) : recipients.length ? (
                  <div className="flex flex-col gap-2">
                    {recipients.map((u) => (
                      <div key={u.uuid} className="flex items-center gap-2.5">
                        {u.profile_picture ? (
                          <img src={u.profile_picture} alt="" className="size-8 rounded-full object-cover" />
                        ) : (
                          <span className="size-8 rounded-full bg-lightgray dark:bg-white/5 grid place-items-center text-darklink"><Icon icon="solar:user-bold" height={16} /></span>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{u.name}</p>
                          <p className="text-xs text-darklink truncate">@{u.username}</p>
                        </div>
                      </div>
                    ))}
                    {recipientCount > recipients.length && (
                      <p className="text-xs text-darklink">and {recipientCount - recipients.length} more</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-darklink">These accounts no longer exist.</p>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 px-5 py-4 border-t border-ld">
            {!segment && (
              <Button color="primary" size="sm" onClick={() => onDuplicate(n)}>
                <Icon icon="solar:copy-linear" height={16} className="me-1" /> Duplicate
              </Button>
            )}
            {n.status !== "scheduled" && n.status !== "sending" && (
              <Button color="light" size="sm" onClick={() => setKind("resend")}>
                <Icon icon="solar:restart-linear" height={16} className="me-1" /> Send again
              </Button>
            )}
            {n.status === "scheduled" && (
              <Button color="light" size="sm" onClick={() => setKind("cancel")}>
                <Icon icon="solar:calendar-mark-linear" height={16} className="me-1" /> Cancel schedule
              </Button>
            )}
            {n.status !== "sending" && (
              <Button color="light" size="sm" className="ms-auto text-error" onClick={() => setKind("delete")}>
                <Icon icon="solar:trash-bin-trash-linear" height={16} />
              </Button>
            )}
          </div>
          <ConfirmPushAction
            notification={n}
            kind={kind}
            onClose={() => setKind(null)}
            onDone={onClose}
          />
        </div>
      )}
    </Drawer>
  );
};

export default PushDetail;
