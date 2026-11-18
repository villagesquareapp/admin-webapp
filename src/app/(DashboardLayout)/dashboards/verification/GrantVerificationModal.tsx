"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner, TextInput } from "flowbite-react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/app/components/shared/Button";
import { getSearchUser } from "@/app/api/user";
import { grantVerification } from "@/app/api/verification";
import { BADGE_LABEL, PersonCell, VerifiedBadge, shortDate } from "./verificationUi";

type Picked = { uuid: string; name: string | null; username: string | null; profile_picture: string | null; verification_badge?: string };

const PERIODS = [
  { value: "30", label: "1 month" },
  { value: "90", label: "3 months" },
  { value: "180", label: "6 months" },
  { value: "365", label: "1 year" },
  { value: "custom", label: "Until a date" },
];

const OUTCOME: Record<string, { label: string; tone: string }> = {
  granted: { label: "Verified", tone: "text-success" },
  extended: { label: "Extended", tone: "text-success" },
  unchanged: { label: "No change", tone: "text-darklink" },
  skipped: { label: "Skipped", tone: "text-warning" },
};

const tomorrow = () => new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

// Verify people without payment (ambassadors, partners): pick them, pick the
// badge and how long it lasts. Each person's outcome is shown after.
const GrantVerificationModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Picked[]>([]);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState<Picked[]>([]);
  const [badge, setBadge] = useState<"greencheck" | "premium">("greencheck");
  const [period, setPeriod] = useState("90");
  const [until, setUntil] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [outcome, setOutcome] = useState<IGrantVerificationResult | null>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setResults([]);
    setPicked([]);
    setBadge("greencheck");
    setPeriod("90");
    setUntil("");
    setNote("");
    setOutcome(null);
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    let live = true;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await getSearchUser(q);
        if (live) setResults((res?.data ?? []) as unknown as Picked[]);
      } finally {
        if (live) setSearching(false);
      }
    }, 300);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [query]);

  const isPicked = (id: string) => picked.some((p) => p.uuid === id);
  const toggle = (u: Picked) =>
    setPicked((list) => (isPicked(u.uuid) ? list.filter((p) => p.uuid !== u.uuid) : [...list, u]));

  const submit = async () => {
    if (!picked.length) return toast.error("Pick at least one person");
    if (period === "custom" && !until) return toast.error("Choose the end date");
    setSaving(true);
    try {
      const res = await grantVerification({
        user_ids: picked.map((p) => p.uuid),
        badge,
        ...(period === "custom"
          ? { ends_at: new Date(`${until}T23:59:59`).toISOString() }
          : { days: Number(period) }),
        note: note.trim() || undefined,
      });
      if (res?.status && res.data) {
        setOutcome(res.data);
        router.refresh();
        const done = res.data.granted + res.data.extended;
        if (done) toast.success(`${done} ${done === 1 ? "person" : "people"} verified`);
        else toast.message("Nobody was changed");
      } else {
        toast.error(res?.message || "Couldn't verify them");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={open} onClose={onClose} size="2xl">
      <ModalHeader>{outcome ? "Done" : "Verify people"}</ModalHeader>
      <ModalBody>
        {outcome ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm">
              {BADGE_LABEL[outcome.badge]} until {shortDate(outcome.ends_at)}: {outcome.granted} verified, {outcome.extended} extended,{" "}
              {outcome.unchanged} unchanged, {outcome.skipped} skipped.
            </p>
            <ul className="flex flex-col divide-y divide-border dark:divide-darkborder">
              {outcome.results.map((r) => (
                <li key={r.user_id} className="py-2 flex items-center justify-between gap-3">
                  <span className="text-sm min-w-0 truncate">
                    {r.name || "Unknown"} <span className="text-darklink">{r.username ? `@${r.username}` : ""}</span>
                  </span>
                  <span className={`text-xs text-end ${OUTCOME[r.outcome]?.tone}`}>
                    <span className="font-semibold">{OUTCOME[r.outcome]?.label}</span>
                    {r.message && <span className="block text-darklink">{r.message}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div>
              <Label htmlFor="grant-search">People</Label>
              <TextInput
                id="grant-search"
                icon={() => <Icon icon="solar:magnifer-linear" height={16} className="text-darklink" />}
                placeholder="Search by name or username"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {(searching || results.length > 0) && (
                <div className="mt-2 border border-ld rounded-lg max-h-56 overflow-y-auto">
                  {searching && (
                    <div className="p-3 text-sm text-darklink flex items-center gap-2">
                      <Spinner size="sm" /> Searching…
                    </div>
                  )}
                  {!searching &&
                    results.map((u) => (
                      <button
                        key={u.uuid}
                        type="button"
                        onClick={() => toggle(u)}
                        className="w-full flex items-center justify-between gap-3 px-3 py-2 hover:bg-lightgray dark:hover:bg-white/5 text-start"
                      >
                        <PersonCell user={u} />
                        <span className="flex items-center gap-2 shrink-0">
                          {u.verification_badge && u.verification_badge !== "none" && <VerifiedBadge badge={u.verification_badge} />}
                          <Icon
                            icon={isPicked(u.uuid) ? "mdi:checkbox-marked" : "mdi:checkbox-blank-outline"}
                            height={20}
                            className={isPicked(u.uuid) ? "text-primary" : "text-darklink"}
                          />
                        </span>
                      </button>
                    ))}
                </div>
              )}
              {picked.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {picked.map((p) => (
                    <span key={p.uuid} className="inline-flex items-center gap-1 text-xs bg-lightprimary text-primary rounded-full ps-3 pe-1 py-1">
                      {p.name || p.username}
                      <button type="button" aria-label={`Remove ${p.name ?? p.username}`} onClick={() => toggle(p)} className="p-0.5 rounded-full hover:bg-white/40">
                        <Icon icon="solar:close-circle-linear" height={15} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-darklink mt-2">
                {picked.length ? `${picked.length} selected. ` : ""}Up to 200 at a time. No ID documents are needed.
              </p>
            </div>

            <div>
              <Label>Badge</Label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                {(["greencheck", "premium"] as const).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBadge(b)}
                    className={`rounded-lg border p-3 text-start transition ${badge === b ? "border-primary ring-1 ring-primary" : "border-ld"}`}
                  >
                    <VerifiedBadge badge={b} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>How long</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {PERIODS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPeriod(p.value)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                      period === p.value ? "bg-primary text-white border-primary" : "border-ld text-darklink"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {period === "custom" && (
                <TextInput type="date" className="mt-2 max-w-[220px]" min={tomorrow()} value={until} onChange={(e) => setUntil(e.target.value)} />
              )}
              <p className="text-xs text-darklink mt-1">
                The badge goes on its end date. Someone already granted the same badge for longer keeps it; a paid subscription is left alone.
              </p>
            </div>

            <div>
              <Label htmlFor="grant-note">Note for staff (optional)</Label>
              <TextInput
                id="grant-note"
                maxLength={120}
                placeholder="e.g. Campus ambassador, UNILORIN"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <p className="text-xs text-darklink mt-1">Shown in Verified accounts and searchable there. Never shown in the app.</p>
            </div>
          </div>
        )}
      </ModalBody>
      <ModalFooter className="justify-end">
        {outcome ? (
          <Button color="primary" onClick={onClose}>
            Close
          </Button>
        ) : (
          <>
            <Button color="light" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button color="primary" onClick={submit} disabled={saving || !picked.length}>
              {saving && <Spinner size="sm" light className="me-2" />}
              Verify {picked.length || ""} {picked.length === 1 ? "person" : "people"}
            </Button>
          </>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default GrantVerificationModal;
