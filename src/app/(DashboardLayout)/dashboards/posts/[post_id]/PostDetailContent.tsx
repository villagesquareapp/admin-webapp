"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { formatDistanceToNow } from "date-fns";
import CardBox from "@/app/components/shared/CardBox";
import PostVideo from "../PostVideo";
import PostModerationPanel from "../PostModerationPanel";
import PostTypeBadge from "../PostTypeBadge";
import { formatDate } from "@/utils/dateUtils";
import { POST_STATUS_TONE } from "@/utils/moderationLabels";

type Detail = IPostDetail["post_details"];

const fmt = (n: number) => new Intl.NumberFormat("en", { notation: "compact" }).format(n || 0);

const StatusBadge = ({ status, deleted }: { status: string; deleted?: boolean }) => {
  if (deleted) return <span className="text-xs px-2.5 py-1 rounded-full bg-lighterror text-error font-semibold">Taken down</span>;
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-semibold ${POST_STATUS_TONE[status] || "bg-lightgray text-darklink dark:bg-dark"}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
};

const Stat = ({ icon, value, label }: { icon: string; value: number; label: string }) => (
  <div className="flex flex-col items-center gap-1 rounded-lg bg-white/5 py-2.5">
    <Icon icon={icon} height={17} className="text-white/80" />
    <span className="text-[13px] font-bold text-white tabular-nums">{fmt(value)}</span>
    <span className="text-[10px] text-white/50">{label}</span>
  </div>
);

const Tile = ({ icon, label, value }: { icon: string; label: string; value?: string | number | null }) => (
  <div className="bg-lightgray dark:bg-dark rounded-md p-3 min-w-0">
    <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-wide text-darklink font-semibold">
      <Icon icon={icon} height={13} /> {label}
    </div>
    <div className="text-sm font-medium mt-1 truncate">{value ?? "—"}</div>
  </div>
);

const SnapshotRow = ({ p, currentId }: { p: IPostSnapshot; currentId: string }) => (
  <Link
    href={`/dashboards/posts/${p.uuid}`}
    className={`flex items-center gap-3 p-2.5 rounded-lg border transition ${
      p.uuid === currentId
        ? "border-primary bg-lightprimary"
        : "border-border dark:border-darkborder hover:border-primary"
    }`}
  >
    <div className="relative w-9 h-12 rounded-md overflow-hidden bg-lightgray dark:bg-dark shrink-0">
      {p.media?.[0]?.thumbnail && <Image src={p.media[0].thumbnail} alt="" fill className="object-cover" />}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium truncate">{p.caption || "Untitled"}</p>
      <p className="text-xs text-darklink">
        {p.created_at ? formatDistanceToNow(new Date(p.created_at), { addSuffix: true }) : ""}
      </p>
    </div>
    {p.uuid === currentId && <span className="text-[10px] font-bold text-primary shrink-0">CURRENT</span>}
    <StatusBadge status={p.status} deleted={!!p.deleted_at} />
  </Link>
);

const PostDetailContent = ({ detail, postId }: { detail: Detail | null; postId: string }) => {
  const router = useRouter();
  const [mediaIndex, setMediaIndex] = useState(0);

  if (!detail) {
    return (
      <CardBox>
        <div className="py-16 text-center text-darklink">
          <Icon icon="solar:document-text-linear" height={40} className="mx-auto mb-3" />
          <p>Post not found.</p>
          <Link href="/dashboards/posts/list" className="text-primary text-sm font-semibold mt-3 inline-block">
            ← Back to posts
          </Link>
        </div>
      </CardBox>
    );
  }

  // Defensive defaults: tolerate a partial/older API response without crashing.
  const media = detail.content?.media || [];
  const cur = media[mediaIndex];
  const m = detail.metrics || ({} as Detail["metrics"]);
  const thread = detail.thread || { root_id: "", is_root: true, part_count: 0, reply_count: 0, parts: [] };

  return (
    <div className="flex flex-col gap-5">
      {/* top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboards/posts/list"
            className="size-9 rounded-full grid place-items-center border border-ld hover:border-primary hover:text-primary text-darklink transition"
          >
            <Icon icon="solar:alt-arrow-left-linear" height={18} />
          </Link>
          <div>
            <h4 className="text-xl font-extrabold tracking-tight">Post details</h4>
            <p className="text-[11px] text-darklink font-mono">{detail.uuid}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PostTypeBadge post={detail} showSingle />
          {detail.is_duplicate && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-lightwarning text-warning font-semibold">Shadow-limited</span>
          )}
          <StatusBadge status={detail.status} deleted={!!detail.deleted_at} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 items-start">
        {/* media stage */}
        <div className="col-span-12 lg:col-span-5">
          <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-b from-[#141f33] to-[#0b1320] shadow-lg">
            <div className="relative w-full max-w-[420px] mx-auto">
              {media.length > 1 && (
                <>
                  <button
                    onClick={() => setMediaIndex((p) => (p === 0 ? media.length - 1 : p - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
                  >
                    <Icon icon="solar:alt-arrow-left-linear" height={20} />
                  </button>
                  <button
                    onClick={() => setMediaIndex((p) => (p === media.length - 1 ? 0 : p + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
                  >
                    <Icon icon="solar:alt-arrow-right-linear" height={20} />
                  </button>
                </>
              )}
              {media.length === 0 ? (
                <div className="aspect-[4/5] grid place-items-center text-white/60 text-center px-6">
                  <div>
                    <Icon icon="solar:text-square-linear" height={34} className="mx-auto mb-2" />
                    <p className="text-sm">Text-only post</p>
                  </div>
                </div>
              ) : cur?.type === "video" ? (
                <PostVideo src={cur.url} showEchoButtons={false} />
              ) : (
                <div className="w-full aspect-[4/5] relative rounded-xl overflow-hidden">
                  {cur?.url && <Image src={cur.url} alt="post" fill sizes="420px" className="object-cover" />}
                </div>
              )}
            </div>

            {media.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-3">
                {media.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setMediaIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${i === mediaIndex ? "w-5 bg-white" : "w-1.5 bg-white/40"}`}
                  />
                ))}
              </div>
            )}

            <div className="mt-4 grid grid-cols-4 gap-2">
              <Stat icon="solar:eye-bold" value={m.views} label="Views" />
              <Stat icon="solar:heart-bold" value={m.likes} label="Likes" />
              <Stat icon="solar:chat-round-bold" value={m.replies} label="Replies" />
              <Stat icon="solar:share-bold" value={m.shares} label="Shares" />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white/80">
                {media.length ? `${media.length} media` : "Text"}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white/80 capitalize">
                {m.privacy}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white/60">
                {formatDate(m.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* content + moderation */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-5">
          {/* author + caption */}
          <CardBox>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative size-12 rounded-full overflow-hidden shrink-0 ring-2 ring-primary/20 bg-muted dark:bg-dark">
                  {detail.author?.profile_picture && (
                    <Image src={detail.author.profile_picture} alt="" fill className="object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold truncate">{detail.author?.name || "Unknown"}</p>
                  <p className="text-sm text-darklink truncate">@{detail.author?.username}</p>
                </div>
              </div>
              {detail.author && (
                <Link
                  href={`/dashboards/users?search=${detail.author.username}`}
                  className="flex items-center gap-1.5 text-xs font-semibold border border-ld hover:border-primary hover:text-primary rounded-full px-3.5 py-2 shrink-0 transition"
                >
                  View author <Icon icon="solar:alt-arrow-right-linear" height={14} />
                </Link>
              )}
            </div>
            <p className="text-[15px] leading-relaxed mt-4 whitespace-pre-wrap">{detail.content.caption || "—"}</p>
          </CardBox>

          {/* thread / reply / quote context */}
          {thread.part_count > 1 && (
            <CardBox>
              <h5 className="card-title mb-3 flex items-center gap-2">
                <Icon icon="solar:list-arrow-down-linear" height={18} className="text-primary" />
                Thread · {thread.part_count} parts
                {thread.reply_count > 0 && (
                  <span className="text-xs font-normal text-darklink">· {thread.reply_count} replies</span>
                )}
              </h5>
              <div className="flex flex-col gap-2">
                {thread.parts.map((p) => (
                  <SnapshotRow key={p.uuid} p={p} currentId={detail.uuid} />
                ))}
              </div>
            </CardBox>
          )}

          {detail.parent && (
            <CardBox>
              <h5 className="card-title mb-3 flex items-center gap-2">
                <Icon icon="solar:reply-linear" height={18} className="text-info" /> Replying to
              </h5>
              <SnapshotRow p={detail.parent} currentId={detail.uuid} />
            </CardBox>
          )}

          {detail.quoted && (
            <CardBox>
              <h5 className="card-title mb-3 flex items-center gap-2">
                <Icon icon="solar:quote-up-linear" height={18} className="text-secondary" /> Quoted post
              </h5>
              <SnapshotRow p={detail.quoted} currentId={detail.uuid} />
            </CardBox>
          )}

          {/* moderation */}
          <CardBox>
            <h5 className="card-title mb-3">Moderation</h5>
            <PostModerationPanel postId={postId} detail={detail} onActed={() => router.refresh()} />
          </CardBox>

          {/* about */}
          <CardBox>
            <h5 className="card-title mb-3">About this post</h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Tile icon="solar:eye-linear" label="Impressions" value={fmt(m.impressions)} />
              <Tile icon="solar:cursor-linear" label="Clicks" value={fmt(m.clicks)} />
              <Tile icon="solar:users-group-rounded-linear" label="Unique views" value={fmt(m.unique_views)} />
              <Tile icon="solar:bolt-linear" label="Engagements" value={fmt(m.engagements)} />
              <Tile icon="solar:map-point-linear" label="Location" value={m.address} />
              <Tile icon="solar:lock-keyhole-minimalistic-linear" label="Privacy" value={m.privacy} />
              <Tile icon="solar:flag-2-linear" label="Reports" value={`${m.report_count} (${m.open_report_count} open)`} />
              <Tile icon="solar:calendar-linear" label="Posted" value={formatDate(m.created_at)} />
            </div>
          </CardBox>

          {/* replies (posts are Twitter-style — a reply is itself a post) */}
          <CardBox>
            <h5 className="card-title mb-3 flex items-center gap-2">
              <Icon icon="solar:reply-2-linear" height={18} className="text-info" />
              Replies {m.replies ? `· ${fmt(m.replies)}` : ""}
            </h5>
            {detail.replies?.length ? (
              <div className="flex flex-col gap-2">
                {detail.replies.map((r) => (
                  <Link
                    key={r.uuid}
                    href={`/dashboards/posts/${r.uuid}`}
                    className="flex gap-2.5 p-2.5 rounded-lg border border-border dark:border-darkborder hover:border-primary transition"
                  >
                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-lightgray dark:bg-dark shrink-0">
                      {r.user?.profile_picture && <Image src={r.user.profile_picture} alt="" fill className="object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">{r.user?.name || "Unknown"}</span>
                        <span className="text-xs text-darklink truncate">@{r.user?.username}</span>
                        {r.created_at && (
                          <span className="text-xs text-darklink shrink-0">
                            · {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      {r.caption && <p className="text-sm mt-0.5 line-clamp-2">{r.caption}</p>}
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-darklink">
                        <span className="flex items-center gap-1"><Icon icon="solar:heart-linear" height={12} />{fmt(r.likes_count)}</span>
                        <span className="flex items-center gap-1"><Icon icon="solar:reply-2-linear" height={12} />{fmt(r.replies_count)}</span>
                        {r.media?.length ? <span className="flex items-center gap-1"><Icon icon="solar:gallery-linear" height={12} />{r.media.length}</span> : null}
                      </div>
                    </div>
                    <StatusBadge status={r.status} deleted={!!r.deleted_at} />
                  </Link>
                ))}
                {m.replies > detail.replies.length && (
                  <p className="text-xs text-darklink text-center pt-1">
                    Showing {detail.replies.length} of {fmt(m.replies)} replies
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-darklink py-2">No replies yet.</p>
            )}
          </CardBox>
        </div>
      </div>
    </div>
  );
};

export default PostDetailContent;
