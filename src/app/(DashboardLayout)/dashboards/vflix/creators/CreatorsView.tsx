"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
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
  active: "bg-lightprimary text-primary",
  suspended: "bg-lightwarning text-warning",
  banned: "bg-lighterror text-error",
};

const CreatorsView = ({
  creators,
  totalPages,
  currentPage,
  pageSize,
}: {
  creators: IVflixCreatorListItem[];
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const setParam = (key: string, value: string) => {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    p.set("page", "1");
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  };
  const onSearch = useDebouncedCallback((v: string) => setParam("search", v), 400);

  const accountAction = (c: IVflixCreatorListItem, action: string) =>
    startTransition(() => {
      toast.info(`${action} @${c.creator.username} — account action lands with backend`);
    });

  const col = createColumnHelper<IVflixCreatorListItem>();
  const columns = [
    col.accessor("creator", {
      header: () => <span>Creator</span>,
      cell: (info) => {
        const c = info.getValue();
        return (
          <div className="flex items-center gap-3">
            <div className="relative size-10 rounded-full overflow-hidden shrink-0 bg-muted dark:bg-dark">
              {c.profile_picture && <Image src={c.profile_picture} alt={c.name} fill className="object-cover" />}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{c.name}</p>
              <p className="text-xs text-darklink truncate">@{c.username}</p>
            </div>
          </div>
        );
      },
    }),
    col.accessor("videos", { header: () => <span>Videos</span>, cell: (i) => <span className="text-sm tabular-nums">{i.getValue()}</span> }),
    col.accessor("views", { header: () => <span>Views</span>, cell: (i) => <span className="text-sm font-semibold tabular-nums">{formatCount(i.getValue())}</span> }),
    col.accessor("likes", { header: () => <span>Likes</span>, cell: (i) => <span className="text-sm tabular-nums text-darklink">{formatCount(i.getValue())}</span> }),
    col.accessor("strikes", {
      header: () => <span>Strikes</span>,
      cell: (i) =>
        i.getValue() > 0 ? (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-lighterror text-error">{i.getValue()}</span>
        ) : (
          <span className="text-xs text-darklink">—</span>
        ),
    }),
    col.accessor("status", {
      header: () => <span>Status</span>,
      cell: (i) => (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[i.getValue()]}`}>
          {i.getValue()}
        </span>
      ),
    }),
    col.accessor("joined", { header: () => <span>Joined</span>, cell: (i) => <span className="text-sm text-darklink">{formatDate(i.getValue())}</span> }),
    col.display({
      id: "actions",
      header: () => <span>Actions</span>,
      cell: (info) => {
        const c = info.row.original;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Dropdown
              label=""
              inline
              renderTrigger={() => (
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                  <HiOutlineDotsVertical />
                </button>
              )}
            >
              <Dropdown.Item onClick={() => router.push(`/dashboards/vflix/creator/${c.creator.uuid}`)}>
                View creator
              </Dropdown.Item>
              <Dropdown.Item onClick={() => accountAction(c, "Suspend")}>Suspend account</Dropdown.Item>
              <Dropdown.Item onClick={() => accountAction(c, "Ban")}>Ban account</Dropdown.Item>
            </Dropdown>
          </div>
        );
      },
    }),
  ];

  const statusFilter = {
    label: "Status",
    key: "status",
    defaultValue: "",
    options: [
      { value: "", label: "All statuses" },
      { value: "active", label: "Active" },
      { value: "suspended", label: "Suspended" },
      { value: "banned", label: "Banned" },
    ],
  };
  const riskFilter = {
    label: "Risk",
    key: "at_risk",
    defaultValue: "",
    options: [
      { value: "", label: "Everyone" },
      { value: "true", label: "At-risk (has strikes)" },
    ],
  };
  const sortFilter = {
    label: "Sort",
    key: "sort",
    defaultValue: "views",
    options: [
      { value: "views", label: "Most views" },
      { value: "videos", label: "Most videos" },
    ],
  };

  return (
    <ReusableTable
      tableData={creators}
      columns={columns}
      totalPages={totalPages}
      currentPage={currentPage}
      pageSize={pageSize}
      dense
      tableTitle="Creators"
      backTo="/dashboards/vflix"
      onRowClick={(c: IVflixCreatorListItem) => router.push(`/dashboards/vflix/creator/${c.creator.uuid}`)}
      filterDropdowns={[statusFilter, riskFilter, sortFilter]}
      extraButtons={
        <div className="relative">
          <Icon icon="solar:magnifer-linear" height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-darklink" />
          <input
            defaultValue={params.get("search") || ""}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search creators"
            className="text-sm bg-lightgray dark:bg-dark border border-ld rounded-md pl-9 pr-3 py-2 w-48 focus:outline-none focus:border-primary"
          />
        </div>
      }
    />
  );
};

export default CreatorsView;
