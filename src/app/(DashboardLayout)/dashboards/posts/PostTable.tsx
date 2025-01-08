"use client";

import ReusableTable from "@/app/components/shared/ReusableTable";
import { formatDate } from "@/utils/dateUtils";
import { Icon } from "@iconify/react";
import { IconDotsVertical } from "@tabler/icons-react";
import { createColumnHelper } from "@tanstack/react-table";
import { Dropdown } from "flowbite-react";
import Image from "next/image";

const PostTable = ({
  posts,
  totalPages,
  currentPage,
  pageSize,
}: {
  posts: IPostResponse | null;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  if (!posts) return <div>No posts found</div>;
  const columnHelper = createColumnHelper<IPosts>();

  const columns = [
    columnHelper.accessor("caption", {
      cell: (info) => (
        <div className="max-w-80">
          <h6 className="text-base break-words whitespace-normal">{info.getValue() || 0}</h6>
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
        <p className="text-darklink dark:text-bodytext text-sm text-center">
          {info.getValue() || 0}
        </p>
      ),
      header: () => <span>Views</span>,
    }),
    columnHelper.accessor("shares_count", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm text-center">
          {info.getValue() || 0}
        </p>
      ),
      header: () => <span>Shares</span>,
    }),
    columnHelper.accessor("likes_count", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm text-center">
          {info.getValue() || 0}
        </p>
      ),
      header: () => <span>Likes</span>,
    }),
    columnHelper.accessor("comments_count", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm text-center">
          {info.getValue() || 0}
        </p>
      ),
      header: () => <span>Comments</span>,
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
      />
    </div>
  );
};

export default PostTable;
