"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { formatDistanceToNow } from "date-fns";
import { getPostReplies } from "@/app/api/post";
import VoiceNotePlayer from "@/app/components/shared/VoiceNotePlayer";
import RemoveRestore from "@/app/components/shared/RemoveRestore";
import { POST_STATUS_TONE } from "@/utils/moderationLabels";

const fmt = (n: number) => new Intl.NumberFormat("en", { notation: "compact" }).format(n || 0);

const ReplyMedia = ({ media, replyId }: { media: IMedia[]; replyId: string }) => {
  const voice = media.find((m) => m.type === "audio" && m.audio_url);
  if (voice) {
    return <VoiceNotePlayer src={voice.audio_url!} duration={voice.duration} waveform={voice.waveform} />;
  }
  const visual = media.filter((m) => m.type === "image" || m.type === "video");
  if (!visual.length) return null;
  return (
    <div className="flex gap-1.5 flex-wrap">
      {visual.slice(0, 4).map((m, i) => (
        <Link
          key={i}
          href={`/dashboards/posts/${replyId}`}
          className="relative size-16 rounded-md overflow-hidden bg-lightgray dark:bg-dark shrink-0"
        >
          {m.thumbnail && <Image src={m.thumbnail} alt="" fill sizes="64px" className="object-cover" />}
          {m.type === "video" && (
            <span className="absolute inset-0 grid place-items-center bg-black/30 text-white">
              <Icon icon="solar:play-bold" height={18} />
            </span>
          )}
        </Link>
      ))}
      {visual.length > 4 && (
        <span className="size-16 rounded-md grid place-items-center bg-lightgray dark:bg-dark text-xs font-semibold text-darklink">
          +{visual.length - 4}
        </span>
      )}
    </div>
  );
};

const ReplyRow = ({ reply }: { reply: IPostReply }) => {
  const [removed, setRemoved] = useState(!!reply.deleted_at);
  return (
    <div className={`flex gap-2.5 p-3 rounded-lg border border-border dark:border-darkborder ${removed ? "opacity-70" : ""}`}>
      <div className="relative size-8 rounded-full overflow-hidden bg-lightgray dark:bg-dark shrink-0">
        {reply.user?.profile_picture && <Image src={reply.user.profile_picture} alt="" fill sizes="32px" className="object-cover" />}
      </div>
      <div className="min-w-0 flex-1 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm truncate">{reply.user?.name || "Unknown"}</span>
          <span className="text-xs text-darklink truncate">@{reply.user?.username}</span>
          {reply.created_at && (
            <span className="text-xs text-darklink">
              · {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
            </span>
          )}
          <span className="ml-auto">
            {removed ? (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-lighterror text-error font-semibold">Removed</span>
            ) : reply.status !== "active" ? (
              <span className={`text-[11px] px-2 py-0.5 rounded-full capitalize font-semibold ${POST_STATUS_TONE[reply.status] || "bg-lightgray text-darklink dark:bg-dark"}`}>
                {reply.status?.replace(/_/g, " ")}
              </span>
            ) : null}
          </span>
        </div>
        {reply.caption && <p className="text-sm whitespace-pre-wrap break-words">{reply.caption}</p>}
        <ReplyMedia media={reply.media || []} replyId={reply.uuid} />
        <div className="flex items-center gap-3 text-[11px] text-darklink flex-wrap">
          <span className="flex items-center gap-1"><Icon icon="solar:heart-linear" height={12} />{fmt(reply.likes_count)}</span>
          <span className="flex items-center gap-1"><Icon icon="solar:reply-2-linear" height={12} />{fmt(reply.replies_count)}</span>
          <Link href={`/dashboards/posts/${reply.uuid}`} className="flex items-center gap-1 font-semibold text-primary hover:underline">
            Open <Icon icon="solar:alt-arrow-right-linear" height={12} />
          </Link>
          <span className="ml-auto flex-1 flex justify-end min-w-[160px]">
            <RemoveRestore serviceType="post" targetId={reply.uuid} removed={removed} onChange={setRemoved} />
          </span>
        </div>
      </div>
    </div>
  );
};

// A post's replies (each is a post), newest first, with their media and
// remove/restore, a page at a time.
const RepliesPanel = ({ postId }: { postId: string }) => {
  const [replies, setReplies] = useState<IPostReply[]>([]);
  const [page, setPage] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(
    async (next: number) => {
      setLoading(true);
      setError(false);
      try {
        const res = await getPostReplies(postId, next);
        const data = res?.data;
        if (!res?.status || !data) throw new Error();
        setReplies((prev) => (next === 1 ? data.data : [...prev, ...data.data]));
        setPage(next);
        setLastPage(data.last_page || 1);
        setTotal(data.total ?? null);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [postId]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  if (error && !replies.length) {
    return (
      <div className="py-6 text-center text-sm text-darklink">
        Couldn&apos;t load the replies.{" "}
        <button type="button" onClick={() => load(1)} className="text-primary font-semibold hover:underline">
          Try again
        </button>
      </div>
    );
  }
  if (!loading && page && !replies.length) {
    return <p className="text-sm text-darklink py-2">No replies yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {total != null && (
        <p className="text-xs text-darklink">
          {total} {total === 1 ? "reply" : "replies"}, newest first
        </p>
      )}
      {replies.map((r) => (
        <ReplyRow key={r.uuid} reply={r} />
      ))}
      {loading ? (
        <div className="py-3 grid place-items-center text-darklink">
          <Icon icon="svg-spinners:180-ring" height={20} />
        </div>
      ) : (
        page < lastPage && (
          <button
            type="button"
            onClick={() => load(page + 1)}
            className="text-sm font-semibold text-primary border border-ld rounded-lg py-2 hover:border-primary transition"
          >
            Load more replies
          </button>
        )
      )}
    </div>
  );
};

export default RepliesPanel;
