"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";
import { createColumnHelper } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import { Dropdown } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "sonner";
import ReusableTable from "@/app/components/shared/ReusableTable";
import { formatCount } from "../vflixStatus";
import { formatDate } from "@/utils/dateUtils";

const STATUS_STYLE: Record<string, string> = {
  ongoing: "bg-lightprimary text-primary",
  completed: "bg-lightsuccess text-success",
};

const SeriesView = ({
  series,
  totalPages,
  currentPage,
  pageSize,
}: {
  series: IVflixSeries[];
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const onSearch = useDebouncedCallback((v: string) => {
    const p = new URLSearchParams(params.toString());
    if (v) p.set("search", v);
    else p.delete("search");
    p.set("page", "1");
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  }, 400);

  const col = createColumnHelper<IVflixSeries>();
  const columns = [
    col.accessor("title", {
      header: () => <span>Series</span>,
      cell: (info) => (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-[52px] rounded-md overflow-hidden bg-muted dark:bg-dark shrink-0">
            <Image src={info.row.original.cover} alt="" fill className="object-cover" />
          </div>
          <p className="font-semibold text-sm truncate">{info.getValue()}</p>
        </div>
      ),
    }),
    col.accessor("creator", { header: () => <span>Creator</span>, cell: (i) => <span className="text-sm text-darklink">@{i.getValue().username}</span> }),
    col.accessor("episodes", { header: () => <span>Episodes</span>, cell: (i) => <span className="text-sm tabular-nums">{i.getValue()}</span> }),
    col.accessor("views", { header: () => <span>Views</span>, cell: (i) => <span className="text-sm font-semibold tabular-nums">{formatCount(i.getValue())}</span> }),
    col.accessor("status", {
      header: () => <span>Status</span>,
      cell: (i) => <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[i.getValue()]}`}>{i.getValue()}</span>,
    }),
    col.accessor("updated_at", { header: () => <span>Updated</span>, cell: (i) => <span className="text-sm text-darklink">{formatDate(i.getValue())}</span> }),
    col.display({
      id: "actions",
      header: () => <span>Actions</span>,
      cell: () => (
        <Dropdown
          label=""
          inline
          renderTrigger={() => (
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <HiOutlineDotsVertical />
            </button>
          )}
        >
          <Dropdown.Item onClick={() => toast.info("View episodes — coming with backend")}>View episodes</Dropdown.Item>
          <Dropdown.Item onClick={() => toast.info("Reorder — coming with backend")}>Reorder episodes</Dropdown.Item>
          <Dropdown.Item onClick={() => toast.warning("Unpublish — coming with backend")}>Unpublish</Dropdown.Item>
        </Dropdown>
      ),
    }),
  ];

  const statusFilter = {
    label: "Status",
    key: "status",
    defaultValue: "",
    options: [
      { value: "", label: "All statuses" },
      { value: "ongoing", label: "Ongoing" },
      { value: "completed", label: "Completed" },
    ],
  };

  return (
    <ReusableTable
      tableData={series}
      columns={columns}
      totalPages={totalPages}
      currentPage={currentPage}
      pageSize={pageSize}
      dense
      tableTitle="Series & Collections"
      backTo="/dashboards/vflix"
      filterDropdowns={[statusFilter]}
      extraButtons={
        <div className="relative">
          <Icon icon="solar:magnifer-linear" height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-darklink" />
          <input
            defaultValue={params.get("search") || ""}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search series"
            className="text-sm bg-lightgray dark:bg-dark border border-ld rounded-md pl-9 pr-3 py-2 w-44 focus:outline-none focus:border-primary"
          />
        </div>
      }
    />
  );
};

export default SeriesView;
