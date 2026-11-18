"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { formatDistanceToNow } from "date-fns";
import { getVflixCommentReplies, getVflixComments } from "@/app/api/vflix";
import VoiceNotePlayer from "@/app/components/shared/VoiceNotePlayer";
import RemoveRestore from "@/app/components/shared/RemoveRestore";

type Page = IPaginatedResponse<IVflixComment>;

// Comments (or a comment's replies) a page at a time.
const usePages = (fetchPage: (page: number) => Promise<{ status?: boolean; data?: Page } | null | undefined>) => {
  const [items, setItems] = useState<IVflixComment[]>([]);
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
        const res = await fetchPage(next);
        if (!res?.status || !res.data) throw new Error();
        const data = res.data;
        setItems((prev) => (next === 1 ? data.data : [...prev, ...data.data]));
        setPage(next);
        setLastPage(data.last_page || 1);
        setTotal(data.total ?? null);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [fetchPage]
  );

  return { items, page, lastPage, total, loading, error, load };
};

const CommentRow = ({ comment, isReply }: { comment: IVflixComment; isReply?: boolean }) => {
  const [removed, setRemoved] = useState(comment.removed);
  const [open, setOpen] = useState(false);
  return (
    <div className={`flex gap-2.5 ${isReply ? "" : "p-3 rounded-lg border border-border dark:border-darkborder"} ${removed ? "opacity-70" : ""}`}>
      <div className={`relative ${isReply ? "size-7" : "size-8"} rounded-full overflow-hidden bg-lightgray dark:bg-dark shrink-0`}>
        {comment.user?.profile_picture && <Image src={comment.user.profile_picture} alt="" fill sizes="32px" className="object-cover" />}
      </div>
      <div className="min-w-0 flex-1 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm truncate">{comment.user?.name || "Unknown"}</span>
          {comment.user?.username && <span className="text-xs text-darklink truncate">@{comment.user.username}</span>}
          <span className="text-xs text-darklink">
            · {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
          {removed && (
            <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-lighterror text-error font-semibold">Removed</span>
          )}
        </div>
        {comment.text && <p className="text-sm whitespace-pre-wrap break-words">{comment.text}</p>}
        {comment.voice && (
          <VoiceNotePlayer src={comment.voice.url} duration={comment.voice.duration} waveform={comment.voice.waveform} />
        )}
        <div className="flex items-center gap-3 text-[11px] text-darklink flex-wrap">
          <span className="flex items-center gap-1">
            <Icon icon="solar:heart-linear" height={12} />
            {comment.likes_count}
          </span>
          {!isReply && comment.replies_count > 0 && (
            <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center gap-1 font-semibold text-primary hover:underline">
              <Icon icon={open ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear"} height={12} />
              {open ? "Hide replies" : `View ${comment.replies_count} ${comment.replies_count === 1 ? "reply" : "replies"}`}
            </button>
          )}
          <span className="ml-auto flex-1 flex justify-end min-w-[160px]">
            <RemoveRestore serviceType="vflix_comment" targetId={comment.uuid} removed={removed} onChange={setRemoved} />
          </span>
        </div>
        {open && <Replies commentId={comment.uuid} />}
      </div>
    </div>
  );
};

const Replies = ({ commentId }: { commentId: string }) => {
  const fetchPage = useCallback((page: number) => getVflixCommentReplies(commentId, page), [commentId]);
  const { items, page, lastPage, loading, error, load } = usePages(fetchPage);
  useEffect(() => {
    load(1);
  }, [load]);
  return (
    <div className="mt-1 pl-3 border-l-2 border-border dark:border-darkborder flex flex-col gap-3">
      {items.map((r) => (
        <CommentRow key={r.uuid} comment={r} isReply />
      ))}
      {error && <p className="text-xs text-error">Couldn&apos;t load the replies.</p>}
      {loading ? (
        <Icon icon="svg-spinners:180-ring" height={16} className="text-darklink" />
      ) : (
        page < lastPage && (
          <button type="button" onClick={() => load(page + 1)} className="text-xs font-semibold text-primary self-start hover:underline">
            More replies
          </button>
        )
      )}
    </div>
  );
};

// A VFlix's comments, newest first: words, voice notes, replies under each,
// removed ones included so they can be restored.
const CommentsPanel = ({ vflixId }: { vflixId: string }) => {
  const fetchPage = useCallback((page: number) => getVflixComments(vflixId, page), [vflixId]);
  const { items, page, lastPage, total, loading, error, load } = usePages(fetchPage);

  useEffect(() => {
    load(1);
  }, [load]);

  if (error && !items.length) {
    return (
      <div className="py-6 text-center text-sm text-darklink">
        Couldn&apos;t load the comments.{" "}
        <button type="button" onClick={() => load(1)} className="text-primary font-semibold hover:underline">
          Try again
        </button>
      </div>
    );
  }
  if (!loading && page && !items.length) {
    return <p className="text-sm text-darklink py-2">No comments yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {total != null && (
        <p className="text-xs text-darklink">
          {total} {total === 1 ? "comment" : "comments"}, newest first
        </p>
      )}
      {items.map((c) => (
        <CommentRow key={c.uuid} comment={c} />
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
            Load more comments
          </button>
        )
      )}
    </div>
  );
};

export default CommentsPanel;
