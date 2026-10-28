"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Spinner, Textarea, TextInput } from "flowbite-react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/app/components/shared/Button";
import { sendPushNotification } from "@/app/api/push-notification";
import { getSearchUser } from "@/app/api/user";
import PushPreview from "./PushPreview";
import { AUDIENCES, compact, formatDateTime } from "./pushUi";

type PickedUser = { uuid: string; name: string; username: string; profile_picture?: string | null };

export interface ComposerDraft {
  title?: string;
  body?: string;
  image_url?: string | null;
  audience?: PushAudience;
  users?: PickedUser[];
}

const TITLE_MAX = 100;
const BODY_MAX = 300;
const toLocalInput = (d: Date) => format(d, "yyyy-MM-dd'T'HH:mm");

const Section = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
  <section className="flex flex-col gap-3">
    <div className="flex items-center gap-2">
      <span className="size-6 rounded-full bg-lightprimary text-primary text-xs font-bold grid place-items-center">{n}</span>
      <h6 className="text-sm font-semibold">{title}</h6>
    </div>
    {children}
  </section>
);

const PushComposer = ({
  isOpen,
  onClose,
  stats,
  draft,
}: {
  isOpen: boolean;
  onClose: () => void;
  stats: IPushStats | null;
  draft?: ComposerDraft | null;
}) => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [audience, setAudience] = useState<PushAudience>("all");
  const [selected, setSelected] = useState<PickedUser[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IRandomUsers[]>([]);
  const [searching, setSearching] = useState(false);
  const [timing, setTiming] = useState<"now" | "later">("now");
  const [scheduleAt, setScheduleAt] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(draft?.title ?? "");
    setBody(draft?.body ?? "");
    setImageUrl(draft?.image_url ?? "");
    setAudience(draft?.audience ?? "all");
    setSelected(draft?.users ?? []);
    setQuery("");
    setResults([]);
    setTiming("now");
    setScheduleAt(toLocalInput(new Date(Date.now() + 60 * 60 * 1000)));
    setConfirmText("");
  }, [isOpen, draft]);

  useEffect(() => {
    if (audience !== "users" || !query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await getSearchUser(query);
        setResults(res?.data || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, audience]);

  const mass = audience !== "users";
  const devices = stats?.devices;
  const reach = audience === "ios" ? devices?.ios : audience === "android" ? devices?.android : devices?.total;
  const remaining = stats?.broadcasts?.remaining;
  const capReached = mass && timing === "now" && remaining === 0;
  const scheduleDate = scheduleAt ? new Date(scheduleAt) : null;
  const imageInvalid = !!imageUrl && !/^https:\/\/\S+$/i.test(imageUrl.trim());

  const problem = useMemo(() => {
    if (!title.trim()) return "Add a title";
    if (!body.trim()) return "Add a message";
    if (imageInvalid) return "The image link must start with https://";
    if (audience === "users" && !selected.length) return "Choose at least one user";
    if (timing === "later") {
      if (!scheduleDate || isNaN(scheduleDate.getTime())) return "Pick a date and time";
      if (scheduleDate.getTime() < Date.now() + 60_000) return "Pick a time at least a minute from now";
      if (scheduleDate.getTime() > Date.now() + 30 * 86_400_000) return "Pushes can be scheduled up to 30 days ahead";
    }
    if (capReached) return "The daily limit for pushes to a whole audience is used up";
    if (mass && confirmText.trim() !== "SEND") return "Type SEND to confirm";
    return null;
  }, [title, body, imageInvalid, audience, selected, timing, scheduleDate, capReached, mass, confirmText]);

  const toggleUser = (u: PickedUser) =>
    setSelected((prev) => (prev.some((x) => x.uuid === u.uuid) ? prev.filter((x) => x.uuid !== u.uuid) : [...prev, u]));

  const submit = async () => {
    if (problem) {
      toast.error(problem);
      return;
    }
    setSending(true);
    try {
      const res = await sendPushNotification({
        title: title.trim(),
        body: body.trim(),
        audience,
        ...(audience === "users" ? { user_ids: selected.map((u) => u.uuid) } : {}),
        ...(imageUrl.trim() ? { image_url: imageUrl.trim() } : {}),
        ...(timing === "later" && scheduleDate ? { scheduled_at: scheduleDate.toISOString() } : {}),
      });
      if (!res?.status) {
        toast.error(res?.message || "The push wasn't sent");
        return;
      }
      const row = res.data as IPushNotifications | undefined;
      if (row?.status === "scheduled") toast.success(`Scheduled for ${formatDateTime(row.scheduled_at)}`);
      else if (row?.status === "sending") toast.success("Sending now. Delivery counts fill in as it goes.");
      else if (row?.status === "partial") toast.warning(`Reached ${row.success_count} devices; ${row.failure_count} refused it`);
      else toast.success("Push sent");
      onClose();
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message || "The push wasn't sent");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={() => !sending && onClose()} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel className="w-full max-w-5xl rounded-2xl bg-white dark:bg-darkgray shadow-xl dark:shadow-dark-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ld">
              <div>
                <DialogTitle className="text-lg font-semibold">New push notification</DialogTitle>
                <p className="text-xs text-darklink mt-0.5">Shows on people’s phones like any app notification.</p>
              </div>
              <button onClick={onClose} disabled={sending} className="p-2 rounded-full text-darklink hover:bg-lightgray dark:hover:bg-white/5" aria-label="Close">
                <Icon icon="solar:close-circle-linear" height={22} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px]">
              <div className="flex flex-col gap-6 p-6 lg:border-e border-ld">
                <Section n={1} title="Message">
                  <div>
                    <TextInput value={title} maxLength={TITLE_MAX} placeholder="Title" onChange={(e) => setTitle(e.target.value)} disabled={sending} />
                    <p className="text-right text-[11px] text-darklink mt-1">{title.length}/{TITLE_MAX}</p>
                  </div>
                  <div>
                    <Textarea rows={4} value={body} maxLength={BODY_MAX} placeholder="What do you want to tell people?" onChange={(e) => setBody(e.target.value)} disabled={sending} />
                    <p className="text-right text-[11px] text-darklink mt-1">{body.length}/{BODY_MAX}</p>
                  </div>
                  <div>
                    <TextInput
                      value={imageUrl}
                      placeholder="Image link (optional), https://…"
                      onChange={(e) => setImageUrl(e.target.value)}
                      color={imageInvalid ? "failure" : undefined}
                      disabled={sending}
                    />
                    <p className="text-[11px] text-darklink mt-1">Shown on Android, and on iOS where the app supports rich pushes.</p>
                  </div>
                </Section>

                <Section n={2} title="Audience">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {AUDIENCES.map((a) => {
                      const on = audience === a.value;
                      const count = a.value === "ios" ? devices?.ios : a.value === "android" ? devices?.android : a.value === "all" ? devices?.total : null;
                      return (
                        <button
                          key={a.value}
                          type="button"
                          onClick={() => setAudience(a.value)}
                          disabled={sending}
                          className={`text-left rounded-xl border p-3 transition-colors ${
                            on ? "border-primary bg-lightprimary/60 dark:bg-lightprimary/10" : "border-ld hover:border-primary/50"
                          }`}
                        >
                          <Icon icon={a.icon} height={20} className={on ? "text-primary" : "text-darklink"} />
                          <p className="text-sm font-semibold mt-1.5">{a.label}</p>
                          <p className="text-[11px] text-darklink">{count != null ? `${compact(count)} devices` : a.hint}</p>
                        </button>
                      );
                    })}
                  </div>

                  {audience === "users" && (
                    <div className="rounded-xl border border-ld p-3 flex flex-col gap-3">
                      {selected.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selected.map((u) => (
                            <span key={u.uuid} className="flex items-center gap-1.5 bg-lightprimary text-primary rounded-full ps-1 pe-2 py-0.5 text-xs font-medium">
                              {u.profile_picture ? (
                                <img src={u.profile_picture} alt="" className="size-5 rounded-full object-cover" />
                              ) : (
                                <Icon icon="solar:user-circle-bold" height={20} />
                              )}
                              {u.name}
                              <button type="button" onClick={() => toggleUser(u)} aria-label={`Remove ${u.name}`} className="hover:text-error">
                                <Icon icon="solar:close-circle-bold" height={14} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <TextInput
                        icon={() => <Icon icon="solar:magnifer-linear" height={16} className="text-darklink" />}
                        value={query}
                        placeholder="Search by name, username or email"
                        onChange={(e) => setQuery(e.target.value)}
                        disabled={sending}
                      />
                      {(searching || results.length > 0 || query.trim()) && (
                        <div className="max-h-56 overflow-y-auto -mx-1">
                          {searching ? (
                            <div className="flex justify-center py-4"><Spinner size="sm" /></div>
                          ) : results.length ? (
                            results.map((u) => {
                              const on = selected.some((x) => x.uuid === u.uuid);
                              return (
                                <button
                                  key={u.uuid}
                                  type="button"
                                  onClick={() => toggleUser(u)}
                                  className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-left ${on ? "bg-lightprimary/60 dark:bg-lightprimary/10" : "hover:bg-lightgray dark:hover:bg-white/5"}`}
                                >
                                  {u.profile_picture ? (
                                    <img src={u.profile_picture} alt="" className="size-8 rounded-full object-cover" />
                                  ) : (
                                    <span className="size-8 rounded-full bg-lightgray dark:bg-white/5 grid place-items-center text-darklink"><Icon icon="solar:user-bold" height={16} /></span>
                                  )}
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-medium truncate">{u.name}</span>
                                    <span className="block text-xs text-darklink truncate">@{u.username}</span>
                                  </span>
                                  <Icon icon={on ? "solar:check-circle-bold" : "solar:add-circle-linear"} height={18} className={on ? "text-primary" : "text-darklink"} />
                                </button>
                              );
                            })
                          ) : (
                            <p className="text-center text-xs text-darklink py-3">No users found</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </Section>

                <Section n={3} title="When">
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
                </Section>

                {mass && (
                  <div className={`rounded-xl p-4 flex flex-col gap-3 ${capReached ? "bg-lighterror/60 dark:bg-lighterror/10" : "bg-lightwarning/50 dark:bg-lightwarning/10"}`}>
                    <div className="flex items-start gap-2.5">
                      <Icon icon="solar:danger-triangle-bold-duotone" height={20} className={capReached ? "text-error" : "text-warning"} />
                      <div className="text-sm">
                        <p className="font-semibold">
                          This goes to {audience === "all" ? "everyone" : `every ${audience === "ios" ? "iOS" : "Android"} device`}
                          {reach != null ? ` (about ${compact(reach)} devices)` : ""}.
                        </p>
                        <p className="text-darklink text-xs mt-0.5">
                          {remaining != null
                            ? `${remaining} of ${stats?.broadcasts.limit} whole-audience pushes left in the last 24 hours.`
                            : "At most 3 whole-audience pushes can go out in 24 hours."}
                          {capReached && stats?.broadcasts.next_slot_at ? ` Next one frees up ${formatDateTime(stats.broadcasts.next_slot_at)}, or schedule it for later.` : ""}
                        </p>
                      </div>
                    </div>
                    <TextInput
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="Type SEND to confirm"
                      autoComplete="off"
                      disabled={sending}
                    />
                  </div>
                )}
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
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default PushComposer;
