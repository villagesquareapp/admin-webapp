"use client";

import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import ReusableTable from "@/app/components/shared/ReusableTable";
import PostSearch from "../../posts/PostSearch";
import { fmtDuration, fmtTime, PersonCell, StatusChip } from "../meetingsUi";

const MeetingsTable = ({
  rows,
  totalPages,
  currentPage,
  pageSize,
}: {
  rows: IMeetingListItem[];
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  const router = useRouter();
  const col = createColumnHelper<IMeetingListItem>();

  const columns = [
    col.accessor("title", {
      header: () => <span>Meeting</span>,
      cell: (info) => (
        <div className="min-w-0">
          <p className="text-sm font-medium truncate max-w-[240px]">{info.getValue()}</p>
          <p className="text-xs text-darklink">{info.row.original.code}</p>
        </div>
      ),
    }),
    col.accessor((r) => r.host?.name, {
      id: "host",
      header: () => <span>Host</span>,
      cell: (info) => <PersonCell person={info.row.original.host} />,
    }),
    col.accessor("status", {
      header: () => <span>Status</span>,
      cell: (i) => <StatusChip status={i.getValue()} />,
    }),
    col.accessor("started_at", {
      header: () => <span>Started</span>,
      cell: (i) => <span className="text-sm text-darklink whitespace-nowrap">{fmtTime(i.getValue())}</span>,
    }),
    col.accessor("duration_sec", {
      header: () => <span>Length</span>,
      cell: (i) => <span className="text-sm tabular-nums">{fmtDuration(i.getValue())}</span>,
    }),
    col.accessor("participant_count", {
      header: () => <span>People</span>,
      cell: (i) => <span className="text-sm tabular-nums">{i.getValue()}</span>,
    }),
    col.accessor("late_count", {
      header: () => <span>Late</span>,
      cell: (info) =>
        info.getValue() ? (
          <span className="text-sm font-semibold text-warning tabular-nums">{info.getValue()}</span>
        ) : (
          <span className="text-sm text-darklink">{info.row.original.latecomer_check_in ? "0" : "—"}</span>
        ),
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
      tableTitle="Meetings"
      filterDropdowns={[
        {
          label: "Status",
          key: "status",
          options: [
            { value: "", label: "Live and ended" },
            { value: "live", label: "Live" },
            { value: "ended", label: "Ended" },
          ],
        },
      ]}
      extraButtons={<PostSearch placeholder="Title, code or host..." />}
      onRowClick={(row: IMeetingListItem) => router.push(`/dashboards/meetings/${row.uuid}`)}
    />
  );
};

export default MeetingsTable;
