"use client";

import { useTransition } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import { Dropdown } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { toast } from "sonner";
import ReusableTable from "@/app/components/shared/ReusableTable";
import { toggleSoundFeatured } from "@/app/api/vflix-catalog";
import { formatCount, formatDuration } from "../vflixStatus";

const SoundsView = ({
  sounds,
  totalPages,
  currentPage,
  pageSize,
}: {
  sounds: IVflixSound[];
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  const [pending, startTransition] = useTransition();

  const feature = (s: IVflixSound) =>
    startTransition(async () => {
      const res = await toggleSoundFeatured(s.id, !s.is_featured);
      if (res?.status) toast.success(s.is_featured ? "Removed from featured" : "Sound featured");
      else toast.error(res?.message || "Failed");
    });

  const col = createColumnHelper<IVflixSound>();
  const columns = [
    col.accessor("name", {
      header: () => <span>Sound</span>,
      cell: (info) => (
        <div className="flex items-center gap-3">
          <span className="size-10 rounded-md grid place-items-center bg-lightsecondary text-secondary shrink-0">
            <Icon icon="solar:music-note-2-bold" height={18} />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{info.getValue()}</p>
            <p className="text-xs text-darklink truncate">{info.row.original.artist}</p>
          </div>
        </div>
      ),
    }),
    col.accessor("category", {
      header: () => <span>Category</span>,
      cell: (info) => (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-lightprimary text-primary">
          {info.getValue()}
        </span>
      ),
    }),
    col.accessor("mood_tags", {
      header: () => <span>Mood</span>,
      cell: (info) => (
        <div className="flex flex-wrap gap-1">
          {info.getValue().map((m) => (
            <span key={m} className="text-[11px] px-2 py-0.5 rounded-full bg-lightgray dark:bg-dark text-darklink">
              {m}
            </span>
          ))}
        </div>
      ),
    }),
    col.accessor("duration", {
      header: () => <span>Duration</span>,
      cell: (info) => <span className="text-sm text-darklink">{formatDuration(info.getValue())}</span>,
    }),
    col.accessor("uses_count", {
      header: () => <span>Uses</span>,
      cell: (info) => <span className="text-sm font-semibold tabular-nums">{formatCount(info.getValue())}</span>,
    }),
    col.accessor("is_featured", {
      header: () => <span>Featured</span>,
      cell: (info) => (
        <button
          onClick={() => feature(info.row.original)}
          disabled={pending}
          title={info.getValue() ? "Unfeature" : "Feature"}
          className="disabled:opacity-50"
        >
          <Icon
            icon={info.getValue() ? "solar:star-bold" : "solar:star-linear"}
            height={20}
            className={info.getValue() ? "text-warning" : "text-darklink"}
          />
        </button>
      ),
    }),
    col.display({
      id: "actions",
      header: () => <span>Actions</span>,
      cell: (info) => (
        <Dropdown
          label=""
          inline
          renderTrigger={() => (
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <HiOutlineDotsVertical />
            </button>
          )}
        >
          <Dropdown.Item onClick={() => feature(info.row.original)}>
            {info.row.original.is_featured ? "Unfeature" : "Feature"}
          </Dropdown.Item>
          <Dropdown.Item onClick={() => toast.info("Edit category — coming with backend")}>
            Edit category
          </Dropdown.Item>
          <Dropdown.Item onClick={() => toast.info("Mood tags — coming with backend")}>
            Edit mood tags
          </Dropdown.Item>
          <Dropdown.Item onClick={() => toast.warning("Remove — coming with backend")}>
            Remove
          </Dropdown.Item>
        </Dropdown>
      ),
    }),
  ];

  const categoryFilter = {
    label: "Category",
    key: "category",
    defaultValue: "",
    options: [
      { value: "", label: "All categories" },
      ...["Afrobeats", "Amapiano", "Highlife", "Gospel", "Hip-hop", "Ambient"].map((c) => ({ value: c, label: c })),
    ],
  };

  return (
    <ReusableTable
      tableData={sounds}
      columns={columns}
      totalPages={totalPages}
      currentPage={currentPage}
      pageSize={pageSize}
      dense
      tableTitle="Sounds"
      backTo="/dashboards/vflix/catalog"
      filterDropdowns={[categoryFilter]}
      extraButtons={
        <button
          onClick={() => toast.info("Upload sound — coming with backend")}
          className="flex items-center gap-2 text-sm font-semibold bg-primary text-white px-3.5 py-2 rounded-md"
        >
          <Icon icon="solar:upload-minimalistic-linear" height={17} /> Upload
        </button>
      }
    />
  );
};

export default SoundsView;
