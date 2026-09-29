"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import ReusableTable from "@/app/components/shared/ReusableTable";
import { formatDate } from "@/utils/dateUtils";

const RecentTransfers = ({
  recentTransferData,
  totalPages,
  currentPage,
  pageSize,
}: {
  recentTransferData: IRecentTransferResponse | null;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  const rows = Array.isArray(recentTransferData?.data) ? recentTransferData!.data : [];
  const col = createColumnHelper<IRecentTransfer>();

  const columns = [
    col.accessor("fullname", {
      header: () => <span>Recipient</span>,
      cell: (info) => {
        const r = info.row.original;
        return (
          <div className="flex items-center gap-3 min-w-0">
            <span className="size-9 rounded-full grid place-items-center bg-lightprimary text-primary shrink-0 text-sm font-semibold">
              {(r.fullname || r.username || "?").charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate max-w-[180px]">{r.fullname || "Unknown"}</p>
              <p className="text-xs text-darklink truncate max-w-[180px]">@{r.username}</p>
            </div>
          </div>
        );
      },
    }),
    col.accessor("email", {
      header: () => <span>Email</span>,
      cell: (i) => <span className="text-sm text-darklink truncate max-w-[200px] inline-block">{i.getValue() || "—"}</span>,
    }),
    col.accessor("amount", {
      header: () => <span>Amount</span>,
      cell: (i) => (
        <span className="text-sm font-semibold tabular-nums flex items-center gap-1">
          <Icon icon="solar:dollar-minimalistic-bold" className="text-warning" height={14} />
          {i.getValue()}
        </span>
      ),
    }),
    col.accessor("date_transferred", {
      header: () => <span>Date</span>,
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
      tableTitle="Recent cowry transfers"
    />
  );
};

export default RecentTransfers;
