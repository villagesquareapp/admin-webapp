"use client";

import ReusableTable from "@/app/components/shared/ReusableTable";
import { formatDate } from "@/utils/dateUtils";
import { createColumnHelper } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getVflixStatusList } from "@/app/api/vflix";
import VflixActions from "./VflixActions";
import VflixDialog from "./VflixDialog";
import VflixStatusBadge from "./VflixStatusBadge";
import { formatCount, formatDuration } from "./vflixStatus";

interface FilterDropdown {
  label: string;
  key: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}

const VflixTable = ({
  videos,
  totalPages,
  currentPage,
  pageSize,
  showReportCount = false,
  tableTitle,
  filterDropdowns,
  extraButtons,
}: {
  videos: IVflixVideo[];
  totalPages: number;
  currentPage: number;
  pageSize: number;
  showReportCount?: boolean;
  tableTitle?: string;
  filterDropdowns?: FilterDropdown[];
  extraButtons?: React.ReactNode;
}) => {
  const [statuses, setStatuses] = useState<string[]>([]);
  const [statusLoading, setStatusLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<IVflixVideo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchStatuses = async () => {
      setStatusLoading(true);
      try {
        const res = await getVflixStatusList();
        setStatuses(res?.data || []);
      } catch (error) {
        console.error("Failed to load VFlix statuses:", error);
      } finally {
        setStatusLoading(false);
      }
    };
    fetchStatuses();
  }, []);

  const handleRowClick = (video: IVflixVideo) => {
    setSelectedVideo(video);
    setIsDialogOpen(true);
  };

  const columnHelper = createColumnHelper<IVflixVideo>();

  const columns = [
    columnHelper.accessor("caption", {
      cell: (info) => {
        const v = info.row.original;
        const thumb = v.media?.[0]?.thumbnail;
        const duration = v.media?.[0]?.duration || 0;
        return (
          <div className="flex gap-3 items-center max-w-96">
            <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
              {thumb && <Image src={thumb} alt="thumb" fill className="object-cover" />}
              <span className="absolute bottom-0.5 right-0.5 text-[10px] bg-black/70 text-white px-1 rounded">
                {formatDuration(duration)}
              </span>
              {v.content_type === "carousel" && (
                <span className="absolute top-0.5 right-0.5 text-white">
                  <Icon icon="solar:gallery-wide-linear" height={14} />
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm break-words line-clamp-2">
                {info.getValue() || "Untitled"}
              </p>
              <span className="text-xs text-darklink capitalize">{v.content_type}</span>
            </div>
          </div>
        );
      },
      header: () => <span>Video</span>,
    }),
    columnHelper.accessor("creator.username", {
      cell: (info) => {
        const creator = info.row.original.creator;
        return (
          <div className="flex gap-3 items-center">
            <div className="relative size-10 rounded-full overflow-hidden">
              <Image src={creator.profile_picture} alt={creator.name} fill className="object-cover" />
            </div>
            <div className="sm:max-w-40 flex flex-col">
              <p className="font-medium text-sm truncate">{creator.name}</p>
              <p className="text-xs text-darklink truncate">@{creator.username}</p>
            </div>
          </div>
        );
      },
      header: () => <span>Creator</span>,
    }),
    columnHelper.accessor("views_count", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">{formatCount(info.getValue())}</p>
      ),
      header: () => <span>Views</span>,
    }),
    columnHelper.accessor("likes_count", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">{formatCount(info.getValue())}</p>
      ),
      header: () => <span>Likes</span>,
    }),
    ...(showReportCount
      ? [
          columnHelper.accessor("report_count", {
            cell: (info) => (
              <span className="text-sm font-semibold px-2.5 py-1 rounded-full bg-lighterror text-error">
                {info.getValue() || 0}
              </span>
            ),
            header: () => <span>Reports</span>,
          }),
        ]
      : []),
    columnHelper.accessor("status", {
      cell: (info) => <VflixStatusBadge status={info.getValue()} />,
      header: () => <span>Status</span>,
    }),
    columnHelper.accessor("is_featured", {
      cell: (info) =>
        info.getValue() ? (
          <Icon icon="solar:star-bold" height={20} className="text-warning" />
        ) : (
          <Icon icon="solar:star-linear" height={20} className="text-darklink" />
        ),
      header: () => <span>Featured</span>,
    }),
    columnHelper.accessor("created_at", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">{formatDate(info.getValue())}</p>
      ),
      header: () => <span>Date</span>,
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span>Actions</span>,
      cell: (info) => (
        <VflixActions
          video={info.row.original}
          statuses={statuses}
          statusLoading={statusLoading}
        />
      ),
    }),
  ];

  return (
    <div className="col-span-12">
      <ReusableTable
        tableData={Array.isArray(videos) ? videos : []}
        columns={columns}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
        onRowClick={handleRowClick}
        tableTitle={tableTitle}
        filterDropdowns={filterDropdowns}
        extraButtons={extraButtons}
      />
      <VflixDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        video={selectedVideo}
        statuses={statuses}
      />
    </div>
  );
};

export default VflixTable;
