"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Modal, ModalBody, ModalFooter, ModalHeader, Select, Spinner, Textarea, TextInput } from "flowbite-react";
import { Button } from "@/app/components/shared/Button";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import { formatDate } from "@/utils/dateUtils";
import { getTrybeModerationList } from "@/app/api/trybes";
import { executeModeration } from "@/app/api/moderation";

export type ModerationKind = "posts" | "videos" | "live" | "products";

const LIMIT = 20;

const KIND: Record<
  ModerationKind,
  { empty: string; search: string; types?: { value: string; label: string }[] }
> = {
  posts: {
    empty: "No posts.",
    search: "Text or @username",
    types: [
      { value: "", label: "Posts and replies" },
      { value: "post", label: "Posts" },
      { value: "reply", label: "Replies" },
    ],
  },
  videos: { empty: "No videos.", search: "Caption or @username" },
  live: {
    empty: "No Echoes or Livestreams.",
    search: "Title",
    types: [
      { value: "", label: "Echoes and Livestreams" },
      { value: "echo", label: "Echoes" },
      { value: "livestream", label: "Livestreams" },
    ],
  },
  products: { empty: "No products.", search: "Title or shop" },
};

const STATE_BADGE: Record<ITrybeModerationItem["state"], { color: string; label: string }> = {
  active: { color: "success", label: "Up" },
  taken_down: { color: "failure", label: "Taken down" },
  deleted: { color: "gray", label: "Deleted by author" },
  limited: { color: "warning", label: "Limited" },
};

// The moderation service type and staff page for an item.
const target = (kind: ModerationKind, item: ITrybeModerationItem) => {
  if (kind === "posts") return { type: "post", href: `/dashboards/posts/${item.uuid}` };
  if (kind === "videos") return { type: "vflix", href: `/dashboards/vflix/videos/${item.uuid}` };
  if (kind === "products") return { type: "marketsquare", href: `/dashboards/markets/products/${item.uuid}` };
  return item.kind === "echo"
    ? { type: "echo", href: `/dashboards/echoes/${item.uuid}` }
    : { type: "livestream", href: `/dashboards/livestreams/${item.uuid}` };
};

const Thumb = ({ src }: { src?: string | null }) =>
  src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="size-14 rounded-lg object-cover shrink-0" />
  ) : (
    <span className="size-14 rounded-lg bg-lightgray dark:bg-darkgray grid place-items-center shrink-0 text-darklink">
      <Icon icon="solar:gallery-minimalistic-linear" height={20} />
    </span>
  );

const count = (n: number | undefined, one: string, many: string) => `${n ?? 0} ${(n ?? 0) === 1 ? one : many}`;
const person = (p?: ITrybePersonCard) => (p ? p.name || (p.username ? `@${p.username}` : "Unknown") : "Unknown");

const Details = ({ kind, item }: { kind: ModerationKind; item: ITrybeModerationItem }) => {
  if (kind === "posts") {
    return (
      <>
        {item.parent_post_id ? "Reply" : "Post"} by {person(item.author)}
        {item.is_anonymous ? " (posted anonymously)" : ""}
        {item.category ? ` · ${item.category.name}` : ""} · {count(item.likes_count, "like", "likes")} ·{" "}
        {count(item.replies_count, "reply", "replies")}
      </>
    );
  }
  if (kind === "videos") {
    return (
      <>
        By {person(item.author)} · {count(item.views_count, "view", "views")} · {count(item.likes_count, "like", "likes")}
        {item.status && item.status !== "active" ? ` · ${item.status.replace(/_/g, " ")}` : ""}
      </>
    );
  }
  if (kind === "live") {
    return (
      <>
        {item.kind === "echo" ? "Echo" : "Livestream"} by {person(item.host)} · {item.status} · {item.audience ?? 0}{" "}
        {item.kind === "echo" ? "listeners at peak" : "viewers"}
      </>
    );
  }
  return (
    <>
      {item.currency_symbol ?? ""}
      {Number(item.price ?? 0).toLocaleString()} {item.currency ?? ""} · {item.shop?.name ?? person(item.seller)}
    </>
  );
};

// A Trybe's posts, videos, live sessions or products. Taking one down or
// restoring it goes through the same moderation actions as everywhere else.
const TrybeModeration = ({ trybeId, kind }: { trybeId: string; kind: ModerationKind }) => {
  const [rows, setRows] = useState<ITrybeModerationItem[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const [type, setType] = useState("");
  const [pending, setPending] = useState<{ item: ITrybeModerationItem; action: "remove_content" | "restore_content" } | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const copy = KIND[kind];

  const load = useCallback(async () => {
    setRows(null);
    const res = await getTrybeModerationList(trybeId, kind, page, LIMIT, {
      state: state || undefined,
      type: type || undefined,
      search: search || undefined,
    });
    if (res?.status) {
      setRows(res.data?.data ?? []);
      setTotal(res.data?.total ?? 0);
      setLastPage(res.data?.last_page || 1);
    } else {
      setRows([]);
      toast.error(res?.message || "Couldn't load the list");
    }
  }, [trybeId, kind, page, state, type, search]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      const res = await executeModeration({
        service_type: target(kind, pending.item).type,
        target_id: pending.item.uuid,
        actions: [{ action: pending.action }],
        reason: reason.trim() || undefined,
      });
      const failed = res?.status && Array.isArray(res.data) && res.data.some((r: { result: string }) => r.result !== "executed");
      if (res?.status && !failed) {
        toast.success(pending.action === "remove_content" ? "Taken down" : "Restored");
        setPending(null);
        setReason("");
        await load();
      } else toast.error(res?.message && !failed ? res.message : "Couldn't do that to this item");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <CardBox>
      <form
        className="flex flex-wrap gap-2 mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setSearch(String(new FormData(e.currentTarget).get("q") ?? "").trim());
        }}
      >
        <TextInput name="q" placeholder={copy.search} sizing="sm" defaultValue={search} />
        <Select sizing="sm" value={state} onChange={(e) => {
            setPage(1);
            setState(e.target.value);
          }}>
          <option value="">Any state</option>
          <option value="active">Up</option>
          <option value="taken_down">Taken down</option>
          <option value="deleted">Deleted by author</option>
          {kind === "videos" && <option value="limited">Limited</option>}
        </Select>
        {copy.types && (
          <Select sizing="sm" value={type} onChange={(e) => {
              setPage(1);
              setType(e.target.value);
            }}>
            {copy.types.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        )}
        <Button size="sm" color="light" type="submit">
          Search
        </Button>
        <span className="text-sm text-darklink self-center ms-auto">{total.toLocaleString()} in this Trybe</span>
      </form>

      {!rows ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-darklink py-6 text-center">{copy.empty}</p>
      ) : (
        <div className="flex flex-col divide-y divide-border dark:divide-darkborder">
          {rows.map((item) => {
            const t = target(kind, item);
            const badge = STATE_BADGE[item.state];
            return (
              <div key={`${item.kind ?? kind}-${item.uuid}`} className="flex items-start gap-3 py-3">
                <Thumb src={item.thumbnail ?? item.image ?? item.cover} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={t.href} className="text-sm font-medium text-primary truncate max-w-md">
                      {item.caption || item.title || "(no text)"}
                    </Link>
                    <Badge color={badge.color}>{badge.label}</Badge>
                    {item.open_reports > 0 && (
                      <Badge color="warning">
                        {item.open_reports} open {item.open_reports === 1 ? "report" : "reports"}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-darklink mt-0.5">
                    <Details kind={kind} item={item} /> · {formatDate(item.created_at)}
                  </p>
                  {item.moderation && (
                    <p className="text-xs text-darklink mt-0.5">
                      {item.moderation.action === "remove_content" ? "Taken down" : "Restored"} by{" "}
                      {item.moderation.by || "staff"} on {formatDate(item.moderation.at)}
                      {item.moderation.reason ? ` · "${item.moderation.reason}"` : ""}
                    </p>
                  )}
                </div>
                {item.state === "taken_down" ? (
                  <Button size="xs" color="light" onClick={() => setPending({ item, action: "restore_content" })}>
                    Restore
                  </Button>
                ) : item.state !== "deleted" ? (
                  <Button size="xs" color="light" onClick={() => setPending({ item, action: "remove_content" })}>
                    <Icon icon="solar:trash-bin-minimalistic-linear" height={16} className="me-1" />
                    Take down
                  </Button>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {lastPage > 1 && (
        <div className="flex items-center justify-end gap-2 mt-4 text-sm">
          <Button size="xs" color="light" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="tabular-nums">
            {page} / {lastPage}
          </span>
          <Button size="xs" color="light" disabled={page >= lastPage} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}

      <Modal show={!!pending} onClose={() => !busy && setPending(null)} size="md">
        <ModalHeader>{pending?.action === "restore_content" ? "Restore" : "Take down"}</ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-3">
            <p className="text-sm">
              {pending?.action === "restore_content"
                ? "It comes back where it was."
                : kind === "live"
                  ? "It's ended and hidden. Its host isn't notified from here."
                  : "It's hidden everywhere in the app. Its author isn't notified from here."}
            </p>
            <Textarea rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (kept in the audit log)" autoFocus />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="gray" onClick={() => setPending(null)} disabled={busy}>
            Back
          </Button>
          <Button color={pending?.action === "restore_content" ? "primary" : "failure"} onClick={act} disabled={busy}>
            {busy && <Spinner size="sm" light />}
            {pending?.action === "restore_content" ? "Restore" : "Take down"}
          </Button>
        </ModalFooter>
      </Modal>
    </CardBox>
  );
};

export default TrybeModeration;
