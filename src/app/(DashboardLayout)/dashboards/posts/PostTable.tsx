"use client";

import CardBox from "@/app/components/shared/CardBox";
import ReusableTable from "@/app/components/shared/ReusableTable";
import { formatDate } from "@/utils/dateUtils";
import { createColumnHelper } from "@tanstack/react-table";
import Image from "next/image";
import { useEffect, useState } from "react";
import PostDialog from "./PostDialog";
import PostActions from "./PostActions";
import { getPostStatus } from "@/app/api/post";

const PostTable = ({
  posts,
  totalPages,
  currentPage,
  pageSize,
  // onRefresh,
  // onPageChange,
}: {
  posts: IPostResponse | null;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  // onRefresh?: () => Promise<void>;
  // onPageChange?: (page: number) => void;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<IPosts | null>(null);

  const [statuses, setStatuses] = useState<IPostStatusList[]>([]);
  const [statusLoading, setStatusLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchStatuses = async () => {
      setStatusLoading(true);
      try {
        const res = await getPostStatus();
        setStatuses(res?.data || []);
        setStatusLoading(false);
      } catch (error) {
        console.error("Failed to load post statuses:", error);
      } finally {
        setStatusLoading(false);
      }
    };
    fetchStatuses();
  }, []);

  const columnHelper = createColumnHelper<IPosts>();

  const handleRowClick = (post: IPosts) => {
    setSelectedPost(post);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedPost(null);
  };

  const columns = [
    columnHelper.accessor("caption", {
      cell: (info) => (
        <div className="max-w-80">
          <p className="font-[500] text-base break-words whitespace-normal">
            {info.getValue() || 0}
          </p>
        </div>
      ),
      header: () => <span>Caption</span>,
    }),
    columnHelper.accessor("user.username", {
      cell: (info) => (
        <div className="flex gap-3 items-center">
          <div className="relative size-12 rounded-full">
            <Image
              src={info.row.original.user.profile_picture}
              alt="icon"
              fill
              className="rounded-full object-cover"
            />
          </div>

          <div className="truncat line-clamp-2 sm:max-w-56 flex flex-col">
            <p className="font-medium">{info.row.original.user.name}</p>
            <p className="text-sm text-darklink dark:text-bodytext">
              @{info.row.original.user.username}
            </p>
          </div>
        </div>
      ),
      header: () => <span>Author</span>,
    }),
    columnHelper.accessor("views_count", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">
          {info.getValue() || 0}
        </p>
      ),
      header: () => <span>Views</span>,
    }),
    columnHelper.accessor("likes_count", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">
          {info.getValue() || 0}
        </p>
      ),
      header: () => <span>Likes</span>,
    }),
    columnHelper.accessor("replies_count", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">
          {info.getValue() || 0}
        </p>
      ),
      header: () => <span>Replies</span>,
    }),
    columnHelper.accessor("created_at", {
      cell: (info) => {
        return (
          <p className="text-darklink dark:text-bodytext text-sm">
            {formatDate(info.getValue())}
          </p>
        );
      },
      header: () => <span>Date Posted</span>,
    }),
    columnHelper.accessor("status", {
      cell: (info) => {
        const status = info.getValue();
        const statusStyles = {
          active:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          suspended:
            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
          disabled:
            "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
          reported:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
          flagged:
            "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
          banned:
            "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300",
          shadow_hidden:
            "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
          archived:
            "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        };

        return (
          <span
            className={`text-sm px-3 py-1 capitalize rounded-full w-fit ${statusStyles[status]}`}
          >
            {status}
          </span>
        );
      },
      header: () => <span>Status</span>,
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span>Actions</span>,
      cell: (info) => {
        const post = info.row.original;
        return (
          <PostActions
            post={post}
            statuses={statuses}
            statusLoading={statusLoading}
            // onStatusRefresh={onRefresh ?? (async () => {})}
          />
        );
      },
    }),
    // columnHelper.accessor("actions", {
    //   cell: () => (
    //     <Dropdown
    //       label=""
    //       dismissOnClick={false}
    //       renderTrigger={() => (
    //         <span className="h-9 w-9 flex justify-center items-center rounded-full hover:bg-lightprimary hover:text-primary cursor-pointer">
    //           <IconDotsVertical size={22} />
    //         </span>
    //       )}
    //     >
    //       {[
    //         { icon: "solar:add-circle-outline", listtitle: "Add" },
    //         { icon: "solar:pen-new-square-broken", listtitle: "Edit" },
    //         { icon: "solar:trash-bin-minimalistic-outline", listtitle: "Delete" },
    //       ].map((item, index) => (
    //         <Dropdown.Item key={index} className="flex gap-3">
    //           <Icon icon={item.icon} height={18} />
    //           <span>{item.listtitle}</span>
    //         </Dropdown.Item>
    //       ))}
    //     </Dropdown>
    //   ),
    //   header: () => <span></span>,
    // }),
  ];
  return (
    <div className="col-span-12">
      <ReusableTable
        tableData={posts?.data && Array.isArray(posts?.data) ? posts?.data : []}
        columns={columns}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
        onRowClick={handleRowClick}
      />
      <PostDialog
        isOpen={isDialogOpen}
        setIsOpen={handleDialogClose}
        post={selectedPost}
        postId={selectedPost?.uuid}
      />
    </div>
  );
};

export default PostTable;
