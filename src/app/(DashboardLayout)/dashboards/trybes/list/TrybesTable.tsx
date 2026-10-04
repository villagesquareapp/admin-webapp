"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import { Button } from "flowbite-react";
import ReusableTable from "@/app/components/shared/ReusableTable";
import PostSearch from "../../posts/PostSearch";
import { formatDate } from "@/utils/dateUtils";
import { Chip, TrybeAvatar } from "../trybeUi";

const TrybesTable = ({
  rows,
  types,
  totalPages,
  currentPage,
  pageSize,
}: {
  rows: ITrybeListItem[];
  types: ITrybeType[];
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  const router = useRouter();
  const col = createColumnHelper<ITrybeListItem>();

  const columns = [
    col.accessor("name", {
      header: () => <span>Trybe</span>,
      cell: (info) => {
        const t = info.row.original;
        return (
          <div className="flex items-center gap-3 min-w-0">
            <TrybeAvatar src={t.avatar} name={t.name} />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate max-w-[220px]">{t.name}</p>
              <p className="text-xs text-darklink truncate max-w-[220px]">{t.subtitle || t.tagline}</p>
            </div>
          </div>
        );
      },
    }),
    col.accessor((r) => r.type?.name, {
      id: "type",
      header: () => <span>Type</span>,
      cell: (i) => <span className="text-sm">{i.getValue()}</span>,
    }),
    col.accessor("member_count", {
      header: () => <span>Members</span>,
      cell: (i) => <span className="text-sm tabular-nums">{Number(i.getValue() || 0).toLocaleString()}</span>,
    }),
    col.accessor("pending_requests", {
      header: () => <span>Waiting</span>,
      cell: (info) => {
        const t = info.row.original;
        return t.pending_requests ? (
          <Link
            href={`/dashboards/trybes/requests?trybe_id=${t.uuid}`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm font-semibold text-warning"
          >
            {t.pending_requests} to review
          </Link>
        ) : (
          <span className="text-sm text-darklink">—</span>
        );
      },
    }),
    col.accessor("status", {
      header: () => <span>Status</span>,
      cell: (i) => <Chip value={i.getValue()} />,
    }),
    col.accessor("created_at", {
      header: () => <span>Created</span>,
      cell: (i) => <span className="text-sm text-darklink">{formatDate(i.getValue())}</span>,
    }),
  ];

  return (
    <ReusableTable
      tableData={rows}
      columns={columns}
      totalPages={totalPages}
      currentPage={currentPage}
      pageSize={pageSize}
      dense
      compactTitle
      tableTitle="All Trybes"
      filterDropdowns={[
        {
          label: "Status",
          key: "status",
          options: [
            { value: "", label: "Any status" },
            { value: "active", label: "Active" },
            { value: "suspended", label: "Suspended" },
            { value: "archived", label: "Archived" },
          ],
        },
        {
          label: "Type",
          key: "type_id",
          options: [{ value: "", label: "Any type" }, ...types.map((t) => ({ value: t.uuid, label: t.name }))],
        },
      ]}
      extraButtons={
        <div className="flex gap-2">
          <PostSearch placeholder="Search Trybes..." />
          <Button color="primary" onClick={() => router.push("/dashboards/trybes/new")}>
            New Trybe
          </Button>
        </div>
      }
      onRowClick={(row: ITrybeListItem) => router.push(`/dashboards/trybes/${row.uuid}`)}
    />
  );
};

export default TrybesTable;
