"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import Image from "next/image";
import { HiMiniCheckBadge } from "react-icons/hi2";

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s",
    s: "%ds",
    ss: "%ds",
    m: "1m",
    mm: "%dm",
    h: "1hr",
    hh: "%dhrs",
    d: "1d",
    dd: "%dd",
    M: "1mon",
    MM: "%dmons",
    y: "1yr",
    yy: "%dyrs",
  },
});

const PostHeader = ({
  showMoreDetailButton = true,
  post,
}: {
  showMoreDetailButton?: boolean;
  post: IPosts;
}) => {
  return (
    <div key={post.uuid} className="flex justify-between items-center h-12  px-4">
      {/* Post Header */}
      <div className="flex flex-row gap-x-3 items-center">
        <Image
          src={post?.user?.profile_picture || ""}
          alt={post?.user?.name || ""}
          width={35}
          height={35}
          className="size-12 border-foreground rounded-full border-[1.5px]"
        />
        <div className="flex flex-col gap-y-1">
          <span className="flex flex-row gap-x-2 items-center">
            <span className="font-semibold text-sm">{post?.user?.name}</span>
            {post?.user?.verified_status && (
              <HiMiniCheckBadge className="size-5 text-green-600" />
            )}
          </span>
          <span className="flex flex-row items-center gap-x-1">
            {post?.user?.address && (
              <>
                <span className="text-xs text-muted-foreground">{post?.user?.address}</span>{" "}
              </>
            )}
            <p className="text-xs text-muted-foreground">
              {dayjs(post?.created_at).fromNow()}
            </p>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PostHeader;
