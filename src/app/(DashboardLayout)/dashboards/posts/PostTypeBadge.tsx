"use client";

import { Icon } from "@iconify/react";

const MAP: Record<string, { label: string; icon: string; tone: string }> = {
  thread: { label: "Thread", icon: "solar:list-arrow-down-linear", tone: "bg-lightprimary text-primary" },
  reply: { label: "Reply", icon: "solar:reply-linear", tone: "bg-lightinfo text-info" },
  quote: { label: "Quote", icon: "solar:quote-up-linear", tone: "bg-lightsecondary text-secondary" },
  single: { label: "Post", icon: "solar:document-text-linear", tone: "bg-lightgray text-darklink dark:bg-dark" },
};

const PostTypeBadge = ({
  post,
  showSingle = false,
}: {
  post: { post_type?: string; is_reply?: boolean; is_quote?: boolean; thread_part_count?: number };
  showSingle?: boolean;
}) => {
  const type =
    post.post_type ||
    (post.is_quote ? "quote" : post.is_reply ? "reply" : (post.thread_part_count || 0) > 1 ? "thread" : "single");

  if (type === "single" && !showSingle) return null;
  const m = MAP[type] || MAP.single;
  const count = type === "thread" ? post.thread_part_count : undefined;

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${m.tone}`}>
      <Icon icon={m.icon} height={12} />
      {m.label}
      {count ? ` · ${count}` : ""}
    </span>
  );
};

export default PostTypeBadge;
