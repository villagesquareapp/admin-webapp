"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import ReasonModal from "@/app/components/shared/ReasonModal";
import { Button } from "@/app/components/shared/Button";
import { hideFromTrending, unhideFromTrending } from "@/app/api/discovery";
import { ago, Author, compact, dateTime, PostSnippet } from "../discoveryUi";

const WINDOWS = [
  { value: "1h", label: "Last hour" },
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
];

type Target = { kind: "topic" | "post"; key: string; label: string };

const topicLabel = (t: { topic: string; type: string }) => (t.type === "hashtag" ? `#${t.topic}` : t.topic);

const TrendingView = ({ data }: { data: ITrendingView | null }) => {
  const router = useRouter();
  const params = useSearchParams();
  const [target, setTarget] = useState<Target | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const win = data?.window ?? (params.get("window") || "24h");

  const setWindow = (w: string) => {
    const p = new URLSearchParams(params.toString());
    p.set("window", w);
    router.replace(`?${p.toString()}`, { scroll: false });
  };

  const putBack = async (kind: "topic" | "post", key: string) => {
    setBusy(`${kind}:${key}`);
    const res = await unhideFromTrending(kind, key);
    setBusy(null);
    if (!res?.status) return toast.error(res?.message || "That didn’t work");
    toast.success("Back on trending. The app shows it again within a couple of minutes.");
    router.refresh();
  };

  const canHide = !!data?.hiding_available;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h4 className="text-lg font-bold">Trending</h4>
          <p className="text-sm text-darklink">What the app’s Trending tab is showing. Take a topic or post off it when it shouldn’t be there.</p>
        </div>
        <div className="inline-flex rounded-xl border border-ld p-1">
          {WINDOWS.map((w) => (
            <button
              key={w.value}
              onClick={() => setWindow(w.value)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium ${win === w.value ? "bg-primary text-white" : "text-darklink hover:text-primary"}`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {data && (
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {data.source === "live" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold bg-lightsuccess text-success">
              <span className="size-1.5 rounded-full bg-success animate-pulse" /> Live
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold bg-lightwarning text-warning">
              <Icon icon="solar:history-linear" height={14} /> Hourly snapshot{data.as_of ? ` · ${dateTime(data.as_of)}` : ""}
            </span>
          )}
          {!canHide && (
            <span className="text-warning">Taking things off trending needs the main API update. It isn’t deployed here yet.</span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <CardBox>
          <h5 className="text-sm font-semibold mb-3">Topics</h5>
          <div className="flex flex-col divide-y divide-border dark:divide-darkborder">
            {(data?.topics ?? []).map((t, i) => (
              <div key={t.key} className={`flex items-center justify-between gap-3 py-2.5 ${t.hidden ? "opacity-60" : ""}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 text-xs text-darklink tabular-nums">{i + 1}</span>
                  <span className={`size-8 rounded-lg grid place-items-center shrink-0 ${t.type === "hashtag" ? "bg-lightprimary text-primary" : "bg-lightsecondary text-secondary"}`}>
                    <Icon icon={t.type === "hashtag" ? "solar:hashtag-linear" : "solar:text-field-linear"} height={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{topicLabel(t)}</p>
                    <p className="text-[11px] text-darklink">{compact(t.mention_count)} posts · score {t.trend_score.toFixed(2)}</p>
                  </div>
                </div>
                {t.hidden ? (
                  <Button size="xs" color="light" disabled={busy === `topic:${t.key}`} onClick={() => putBack("topic", t.key)}>Put back</Button>
                ) : (
                  <Button size="xs" color="light" disabled={!canHide} onClick={() => setTarget({ kind: "topic", key: t.key, label: topicLabel(t) })}>
                    Take off
                  </Button>
                )}
              </div>
            ))}
            {!data?.topics?.length && <p className="text-sm text-darklink py-4">Nothing is trending in this window.</p>}
          </div>
        </CardBox>

        <CardBox>
          <h5 className="text-sm font-semibold mb-3">Posts</h5>
          <div className="flex flex-col divide-y divide-border dark:divide-darkborder">
            {(data?.posts ?? []).map((p, i) => (
              <div key={p.post_id} className={`flex items-start justify-between gap-3 py-3 ${p.hidden ? "opacity-60" : ""}`}>
                <div className="flex items-start gap-3 min-w-0">
                  <span className="w-6 text-xs text-darklink tabular-nums pt-1">{i + 1}</span>
                  <div className="min-w-0 flex flex-col gap-2">
                    <Author author={p.author} anonymous={p.post.is_anonymous} />
                    <PostSnippet post={p.post} />
                    <p className="text-[11px] text-darklink">
                      {compact(p.post.likes)} likes · {compact(p.post.replies)} replies · {compact(p.post.views)} views · {ago(p.post.created_at)}
                    </p>
                  </div>
                </div>
                {p.hidden ? (
                  <Button size="xs" color="light" disabled={busy === `post:${p.post_id}`} onClick={() => putBack("post", p.post_id)}>Put back</Button>
                ) : (
                  <Button
                    size="xs"
                    color="light"
                    disabled={!canHide}
                    onClick={() => setTarget({ kind: "post", key: p.post_id, label: p.post.caption?.slice(0, 80) || "This post" })}
                  >
                    Take off
                  </Button>
                )}
              </div>
            ))}
            {!data?.posts?.length && <p className="text-sm text-darklink py-4">No posts are trending in this window.</p>}
          </div>
        </CardBox>
      </div>

      <CardBox>
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-sm font-semibold">Taken off trending</h5>
          <span className="text-xs text-darklink">{data?.hidden?.length ?? 0}</span>
        </div>
        <div className="flex flex-col divide-y divide-border dark:divide-darkborder">
          {(data?.hidden ?? []).map((h) => (
            <div key={`${h.kind}:${h.item_key}`} className="flex items-start justify-between gap-3 py-3">
              <div className="flex items-start gap-3 min-w-0">
                <span className="size-8 rounded-lg grid place-items-center bg-lightgray dark:bg-white/5 text-darklink shrink-0">
                  <Icon icon={h.kind === "post" ? "solar:document-text-linear" : "solar:hashtag-linear"} height={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate max-w-[420px]">{h.label || h.post?.caption || h.item_key}</p>
                  <p className="text-[11px] text-darklink">
                    {h.reason ? `“${h.reason}” · ` : ""}
                    {h.hidden_by_name ? `${h.hidden_by_name} · ` : ""}
                    {ago(h.created_at)}
                  </p>
                </div>
              </div>
              <Button size="xs" color="light" disabled={busy === `${h.kind}:${h.item_key}`} onClick={() => putBack(h.kind, h.item_key)}>
                Put back
              </Button>
            </div>
          ))}
          {!data?.hidden?.length && <p className="text-sm text-darklink py-3">Nothing has been taken off trending.</p>}
        </div>
      </CardBox>

      <ReasonModal
        open={!!target}
        title={target?.kind === "post" ? "Take this post off trending?" : "Take this topic off trending?"}
        text="It stays on VillageSquare; it just stops showing in Trending. The app updates within a couple of minutes."
        subject={target?.label}
        confirmLabel="Take off trending"
        color="warning"
        icon="solar:fire-minimalistic-bold-duotone"
        onClose={() => setTarget(null)}
        onConfirm={async (reason) => {
          if (!target) return;
          const res = await hideFromTrending({ kind: target.kind, item_key: target.key, label: target.label, reason });
          if (!res?.status) {
            toast.error(res?.message || "That didn’t work");
            return false;
          }
          toast.success("Taken off trending");
          router.refresh();
        }}
      />
    </div>
  );
};

export default TrendingView;
