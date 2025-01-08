"use client";

import { BsBookmarkDashFill } from "react-icons/bs";
import { IoChatbubbleEllipses } from "react-icons/io5";
import { CgEyeAlt } from "react-icons/cg";
import { IoMdShareAlt } from "react-icons/io";
import { PiHeartFill } from "react-icons/pi";

const SocialPostActionButtons = ({ post }: { post: IPosts }) => {
  return (
    <div className="flex flex-row justify-between items-center px-4">
      <div className="flex flex-row gap-x-7 items-center">
        <div className="flex flex-row gap-x-1 items-center">
          <PiHeartFill className={`size-6 cursor-pointer`} />
          <p className="text-sm">{post?.likes_count}</p>
        </div>

        <div className="flex flex-row gap-x-1 items-center">
          <IoChatbubbleEllipses className="size-5" />
          <p className="text-sm">{post?.shares_count}</p>
        </div>
        <div className="flex flex-row gap-x-1 items-center">
          <IoMdShareAlt className="size-8" />
          <p className="text-sm">{post?.shares_count}</p>
        </div>
        <div className="flex flex-row gap-x-1 items-center">
          <BsBookmarkDashFill className={`size-5 cursor-pointer`} />
        </div>
      </div>
      <div className="flex items-center gap-x-1">
        <p className="text-sm">{post?.views_count}</p>
        <CgEyeAlt className="size-6" />
      </div>
    </div>
  );
};

export default SocialPostActionButtons;
