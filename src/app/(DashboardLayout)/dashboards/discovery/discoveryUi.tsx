"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { format, formatDistanceToNowStrict, parseISO } from "date-fns";
import { PersonCell } from "../meetings/meetingsUi";

export const ago = (iso?: string | null) => {
  if (!iso) return "—";
  try {
    return formatDistanceToNowStrict(parseISO(iso), { addSuffix: true });
  } catch {
    return iso;
  }
};

export const dateTime = (iso?: string | null) => {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "MMM d, yyyy · h:mm a");
  } catch {
    return iso;
  }
};

export const compact = (n?: number | null) => new Intl.NumberFormat("en", { notation: "compact" }).format(n || 0);

// An anonymous post's author is never shown.
export const Author = ({ author, anonymous }: { author?: IUserBrief | null; anonymous?: boolean }) =>
  anonymous ? (
    <div className="flex items-center gap-3">
      <span className="size-8 rounded-full grid place-items-center bg-lightgray dark:bg-white/5 text-darklink shrink-0">
        <Icon icon="solar:incognito-bold-duotone" height={17} />
      </span>
      <p className="text-sm text-darklink">Anonymous</p>
    </div>
  ) : (
    <PersonCell person={author ?? null} />
  );

export const PostSnippet = ({
  post,
  comment,
}: {
  post: { uuid: string; caption: string | null; status?: string };
  comment?: boolean;
}) => (
  <div className="min-w-0 max-w-[320px]">
    <p className="text-sm line-clamp-2 break-words">{post.caption?.trim() || <span className="text-darklink italic">No text</span>}</p>
    <div className="flex items-center gap-2 mt-1">
      {comment && <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-lightsecondary text-secondary">Comment</span>}
      {post.status && post.status !== "active" && (
        <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-lightwarning text-warning capitalize">{post.status}</span>
      )}
      <Link href={`/dashboards/posts/${post.uuid}`} onClick={(e) => e.stopPropagation()} className="text-[11px] text-primary hover:underline">
        Open post
      </Link>
    </div>
  </div>
);

export const Leaderboard = ({
  title,
  hint,
  rows,
}: {
  title: string;
  hint?: string;
  rows: { user: IUserBrief; count: number; sub?: string }[];
}) => (
  <div>
    <h5 className="text-sm font-semibold">{title}</h5>
    {hint && <p className="text-[11px] text-darklink mb-3">{hint}</p>}
    <div className="flex flex-col gap-2.5">
      {rows.map((r, i) => (
        <div key={`${r.user.uuid}-${i}`} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-5 text-xs text-darklink tabular-nums">{i + 1}</span>
            <PersonCell person={r.user} sub={r.sub} />
          </div>
          <span className="text-sm font-semibold tabular-nums">{compact(r.count)}</span>
        </div>
      ))}
      {!rows.length && <p className="text-sm text-darklink py-2">Nothing this week.</p>}
    </div>
  </div>
);
