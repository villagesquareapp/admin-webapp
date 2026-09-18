"use client";

import ReusableTable from "@/app/components/shared/ReusableTable";
import { createColumnHelper } from "@tanstack/react-table";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatDate } from "@/utils/dateUtils";
import { ECHO_STATUS_TONE, formatDuration } from "@/utils/echoLabels";
import EchoActions from "./EchoActions";

const fmt = (n: number) => new Intl.NumberFormat("en", { notation: "compact" }).format(n || 0);

const EchoTable = ({
  echoes,
  totalPages,
  currentPage,
  pageSize,
  tableTitle,
  backTo,
  filterDropdowns,
  extraButtons,
}: {
  echoes: IEchoes[];
  totalPages: number;
  currentPage: number;
  pageSize: number;
  tableTitle?: string;
  backTo?: string;
  filterDropdowns?: any;
  extraButtons?: React.ReactNode;
}) => {
  const router = useRouter();
  const col = createColumnHelper<IEchoes>();

  const columns = [
    col.accessor("title", {
      header: () => <span>Echo</span>,
      cell: (info) => (
        <div className="flex items-center gap-3 max-w-[300px]">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-lightgray dark:bg-dark shrink-0">
            {info.row.original.cover && <Image src={info.row.original.cover} alt="" fill className="object-cover" />}
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{info.getValue() || "Untitled echo"}</p>
            {info.row.original.is_recurring && <span className="text-[11px] text-darklink">recurring</span>}
          </div>
        </div>
      ),
    }),
    col.accessor("host", {
      header: () => <span>Host</span>,
      cell: (info) => {
        const h = info.getValue();
        return (
          <div className="flex items-center gap-2.5">
            <div className="relative size-8 rounded-full overflow-hidden shrink-0">
              {h?.profile_picture && <Image src={h.profile_picture} alt="" fill className="object-cover" />}
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate max-w-[130px]">{h?.name || "Unknown"}</p>
              <p className="text-xs text-darklink truncate">@{h?.username}</p>
            </div>
          </div>
        );
      },
    }),
    col.accessor("category", {
      header: () => <span>Category</span>,
      cell: (info) => <span className="text-sm text-darklink">{info.getValue()?.name || "—"}</span>,
    }),
    col.accessor("total_listeners_ever", {
      header: () => <span>Listeners</span>,
      cell: (info) => (
        <span className="text-sm tabular-nums">
          {fmt(info.getValue() || info.row.original.peak_listener_count)}
        </span>
      ),
    }),
    col.accessor("total_gifts", {
      header: () => <span>Gifts</span>,
      cell: (info) => <span className="text-sm tabular-nums">{fmt(info.getValue())}</span>,
    }),
    col.accessor("duration_seconds", {
      header: () => <span>Duration</span>,
      cell: (info) => (
        <span className="text-sm text-darklink">
          {info.getValue() ? formatDuration(info.getValue()) : `${info.row.original.duration || 0}m`}
        </span>
      ),
    }),
    col.accessor("status", {
      header: () => <span>Status</span>,
      cell: (info) => (
        <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${ECHO_STATUS_TONE[info.getValue()] || "bg-lightgray text-darklink dark:bg-dark"}`}>
          {info.getValue()}
        </span>
      ),
    }),
    col.accessor("created_at", {
      header: () => <span>Created</span>,
      cell: (info) => <span className="text-sm text-darklink">{formatDate(info.getValue())}</span>,
    }),
    col.display({
      id: "actions",
      header: () => <span>Actions</span>,
      cell: (info) => <EchoActions echo={info.row.original} />,
    }),
  ];

  return (
    <div className="col-span-12">
      <ReusableTable
        tableData={Array.isArray(echoes) ? echoes : []}
        columns={columns}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
        dense
        tableTitle={tableTitle}
        backTo={backTo}
        filterDropdowns={filterDropdowns}
        extraButtons={extraButtons}
        onRowClick={(e: IEchoes) => router.push(`/dashboards/echoes/${e.uuid}`)}
      />
    </div>
  );
};

export default EchoTable;
