"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Spinner, Textarea, TextInput } from "flowbite-react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/app/components/shared/Button";
import { pushToSegment } from "@/app/api/analytics";
import PushPreview from "../../notifications/PushPreview";
import { formatDateTime } from "../../notifications/pushUi";
import { num } from "../analyticsUi";

const TITLE_MAX = 100;
const BODY_MAX = 300;
// Bigger pushes than this ask for SEND to be typed first.
const CONFIRM_ABOVE = 1000;
const toLocalInput = (d: Date) => format(d, "yyyy-MM-dd'T'HH:mm");

const SegmentPushComposer = ({
  segment,
  stats,
  onClose,
}: {
  segment: IAnalyticsSegment | null;
  stats: IPushStats | null;
  onClose: () => void;
}) => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [timing, setTiming] = useState<"now" | "later">("now");
  const [scheduleAt, setScheduleAt] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!segment) return;
    setTitle("");
    setBody("");
    setImageUrl("");
    setTiming("now");
    setScheduleAt(toLocalInput(new Date(Date.now() + 60 * 60 * 1000)));
    setConfirmText("");
  }, [segment]);

  const reach = segment?.push_reachable ?? 0;
  const needsConfirm = reach > CONFIRM_ABOVE;
  const remaining = stats?.broadcasts?.remaining;
  const capReached = timing === "now" && remaining === 0;
  const scheduleDate = scheduleAt ? new Date(scheduleAt) : null;
  const imageInvalid = !!imageUrl && !/^https:\/\/\S+$/i.test(imageUrl.trim());

  const problem = useMemo(() => {
    if (!title.trim()) return "Add a title";
    if (!body.trim()) return "Add a message";
    if (imageInvalid) return "The image link must start with https://";
    if (timing === "later") {
      if (!scheduleDate || isNaN(scheduleDate.getTime())) return "Pick a date and time";
      if (scheduleDate.getTime() < Date.now() + 60_000) return "Pick a time at least a minute from now";
      if (scheduleDate.getTime() > Date.now() + 30 * 86_400_000) return "Pushes can be scheduled up to 30 days ahead";
    }
    if (capReached) return "The daily limit for pushes to a whole audience is used up";
    if (needsConfirm && confirmText.trim() !== "SEND") return "Type SEND to confirm";
    return null;
  }, [title, body, imageInvalid, timing, scheduleDate, capReached, needsConfirm, confirmText]);

  const submit = async () => {
    if (!segment) return;
    if (problem) {
      toast.error(problem);
      return;
    }
    setSending(true);
    try {
      const res = await pushToSegment(segment.key, {
        title: title.trim(),
        body: body.trim(),
        ...(imageUrl.trim() ? { image_url: imageUrl.trim() } : {}),
        ...(timing === "later" && scheduleDate ? { scheduled_at: scheduleDate.toISOString() } : {}),
      });
      if (!res?.status) {
        toast.error(res?.message || "The push wasn't sent");
        return;
      }
      const row = res.data;
      const count = row?.recipients_count ?? reach;
      toast.success(
        row?.status === "scheduled"
          ? `Scheduled for ${formatDateTime(row.scheduled_at)}`
          : `Sending to ${num(count)} people in “${segment.label}”`,
        {
          description: row?.status === "scheduled" ? "It’s listed on the Notifications page." : "Delivery counts fill in on the Notifications page.",
          duration: 10_000,
          action: { label: "View", onClick: () => router.push("/dashboards/notifications?audience=segment") },
        },
      );
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "The push wasn't sent");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={!!segment} onClose={() => !sending && onClose()} className="relative z-[110]">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel className="w-full max-w-4xl rounded-2xl bg-white dark:bg-darkgray shadow-xl dark:shadow-dark-md">
            {segment && (
              <>
                <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-ld">
                  <div className="min-w-0">
                    <DialogTitle className="text-lg font-semibold">Push to “{segment.label}”</DialogTitle>
                    <p className="text-xs text-darklink mt-0.5">{segment.description}</p>
                  </div>
                  <button onClick={onClose} disabled={sending} className="p-2 rounded-full text-darklink hover:bg-lightgray dark:hover:bg-white/5" aria-label="Close">
                    <Icon icon="solar:close-circle-linear" height={22} />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px]">
                  <div className="flex flex-col gap-5 p-6 lg:border-e border-ld">
                    <div className="rounded-xl bg-lightprimary/60 dark:bg-lightprimary/10 px-4 py-3 flex items-start gap-2.5 text-sm">
                      <Icon icon="solar:target-bold-duotone" height={20} className="text-primary shrink-0" />
                      <p>
                        Goes to <span className="font-semibold">{num(reach)} people</span> in this segment with a recent push token
                        <span className="text-darklink"> (of {num(segment.size)} in it). Who’s in it is worked out again when it goes out.</span>
                      </p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div>
                        <TextInput value={title} maxLength={TITLE_MAX} placeholder="Title" onChange={(e) => setTitle(e.target.value)} disabled={sending} />
                        <p className="text-right text-[11px] text-darklink mt-1">{title.length}/{TITLE_MAX}</p>
                      </div>
                      <div>
                        <Textarea rows={4} value={body} maxLength={BODY_MAX} placeholder="What would bring them back?" onChange={(e) => setBody(e.target.value)} disabled={sending} />
                        <p className="text-right text-[11px] text-darklink mt-1">{body.length}/{BODY_MAX}</p>
                      </div>
                      <TextInput
                        value={imageUrl}
                        placeholder="Image link (optional), https://…"
                        onChange={(e) => setImageUrl(e.target.value)}
                        color={imageInvalid ? "failure" : undefined}
                        disabled={sending}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="inline-flex rounded-xl border border-ld p-1 w-fit">
                        {(["now", "later"] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setTiming(t)}
                            disabled={sending}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 ${timing === t ? "bg-primary text-white" : "text-darklink hover:text-primary"}`}
                          >
                            <Icon icon={t === "now" ? "solar:plain-2-linear" : "solar:calendar-linear"} height={16} />
                            {t === "now" ? "Send now" : "Schedule"}
                          </button>
                        ))}
                      </div>
                      {timing === "later" && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <TextInput
                            type="datetime-local"
                            value={scheduleAt}
                            min={toLocalInput(new Date(Date.now() + 2 * 60_000))}
                            max={toLocalInput(new Date(Date.now() + 30 * 86_400_000))}
                            onChange={(e) => setScheduleAt(e.target.value)}
                            disabled={sending}
                          />
                          <span className="text-xs text-darklink">Your time ({Intl.DateTimeFormat().resolvedOptions().timeZone})</span>
                        </div>
                      )}
                    </div>

                    <div className={`rounded-xl p-4 flex flex-col gap-3 ${capReached ? "bg-lighterror/60 dark:bg-lighterror/10" : "bg-lightwarning/50 dark:bg-lightwarning/10"}`}>
                      <div className="flex items-start gap-2.5">
                        <Icon icon="solar:danger-triangle-bold-duotone" height={20} className={capReached ? "text-error" : "text-warning"} />
                        <p className="text-xs text-darklink">
                          Counts toward the 3 whole-audience pushes allowed in 24 hours
                          {remaining != null ? ` (${remaining} of ${stats?.broadcasts.limit} left)` : ""}.
                          {capReached && stats?.broadcasts.next_slot_at ? ` The next one frees up ${formatDateTime(stats.broadcasts.next_slot_at)}, or schedule it for later.` : ""}
                        </p>
                      </div>
                      {needsConfirm && (
                        <TextInput
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                          placeholder={`Type SEND to push to ${num(reach)} people`}
                          autoComplete="off"
                          disabled={sending}
                        />
                      )}
                    </div>
                  </div>

                  <div className="p-6 bg-lightgray/50 dark:bg-white/[0.02] lg:rounded-ee-2xl">
                    <p className="text-xs font-semibold uppercase tracking-wide text-darklink mb-3 text-center">Preview</p>
                    <PushPreview
                      title={title}
                      body={body}
                      imageUrl={imageInvalid ? undefined : imageUrl.trim() || undefined}
                      when={timing === "later" && scheduleDate && !isNaN(scheduleDate.getTime()) ? format(scheduleDate, "EEEE d MMMM") : undefined}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-ld">
                  <p className="text-xs text-darklink truncate">{problem ?? "Ready to go."}</p>
                  <div className="flex gap-2 shrink-0">
                    <Button color="light" onClick={onClose} disabled={sending}>Cancel</Button>
                    <Button color="primary" onClick={submit} disabled={sending || !!problem}>
                      {sending && <Spinner size="sm" light />}
                      <Icon icon={timing === "now" ? "solar:plain-2-bold" : "solar:calendar-add-bold"} height={16} className="me-1" />
                      {timing === "now" ? "Send now" : "Schedule"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default SegmentPushComposer;
