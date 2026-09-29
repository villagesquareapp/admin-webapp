"use client";

import { useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Badge, Button, Modal } from "flowbite-react";
import { toast } from "sonner";
import ReusableTable from "@/app/components/shared/ReusableTable";
import { releaseWithdrawalHold } from "@/app/api/wallet";
import { formatDate } from "@/utils/dateUtils";

const PROVIDERS: Record<string, string> = {
  flutterwave: "Flutterwave",
  apple: "App Store",
  google_play: "Google Play",
};

const num = (n: number) => Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

const statusFilter = {
  label: "Status",
  key: "status",
  options: [
    { value: "", label: "Active holds" },
    { value: "released", label: "Released" },
    { value: "all", label: "All" },
  ],
};

const WithdrawalHoldsTable = ({
  holds,
  status,
  totalPages,
  currentPage,
  pageSize,
}: {
  holds: IWithdrawalHoldsResponse | null;
  status: "active" | "released" | "all";
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  const rows = Array.isArray(holds?.data) ? holds!.data : [];
  const [releasing, setReleasing] = useState<IWithdrawalHold | null>(null);
  const [loading, setLoading] = useState(false);
  const col = createColumnHelper<IWithdrawalHold>();

  const release = async () => {
    if (!releasing) return;
    setLoading(true);
    try {
      const res = await releaseWithdrawalHold(releasing.uuid);
      if (res?.status) {
        toast.success("Hold released; this account can withdraw again");
        setReleasing(null);
      } else {
        toast.error(res?.message || "Failed to release the hold");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    col.accessor((r) => r.user?.name, {
      id: "user",
      header: () => <span>User</span>,
      cell: (info) => {
        const u = info.row.original.user;
        return (
          <div className="flex items-center gap-3 min-w-0">
            <span className="size-9 rounded-full grid place-items-center bg-lightprimary text-primary shrink-0 text-sm font-semibold">
              {(u?.name || u?.username || "?").charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate max-w-[180px]">{u?.name || "Unknown"}</p>
              <p className="text-xs text-darklink truncate max-w-[180px]">
                {u?.username ? `@${u.username}` : u?.email || u?.uuid}
              </p>
            </div>
          </div>
        );
      },
    }),
    col.accessor("reason", {
      header: () => <span>Refund</span>,
      cell: (info) => {
        const h = info.row.original;
        return (
          <div className="min-w-0">
            <p className="text-sm">{h.reason}</p>
            <p className="text-xs text-darklink truncate max-w-[220px]" title={h.purchase_reference}>
              {PROVIDERS[h.provider] || h.provider} · {h.purchase_reference}
            </p>
          </div>
        );
      },
    }),
    col.accessor("shortfall", {
      header: () => <span>Coins not recovered</span>,
      cell: (i) => <span className="text-sm font-semibold tabular-nums text-error">{num(i.getValue())}</span>,
    }),
    col.accessor((r) => r.user?.coin_balance, {
      id: "balances",
      header: () => <span>Balance now</span>,
      cell: (info) => {
        const u = info.row.original.user;
        return (
          <div className="text-xs text-darklink tabular-nums">
            <p>{num(u?.coin_balance)} coins</p>
            <p>{num(u?.cowry_balance)} cowries</p>
          </div>
        );
      },
    }),
    col.accessor("created_at", {
      header: () => <span>Held since</span>,
      cell: (i) => <span className="text-sm text-darklink">{formatDate(i.getValue())}</span>,
    }),
    col.display({
      id: "action",
      header: () => <span>Status</span>,
      cell: (info) => {
        const h = info.row.original;
        if (h.released_at) {
          return (
            <div className="text-xs text-darklink">
              <Badge color="success" className="w-fit mb-1">Released</Badge>
              <p>
                {formatDate(h.released_at)}
                {h.released_by?.name ? ` by ${h.released_by.name}` : ""}
              </p>
            </div>
          );
        }
        return (
          <Button size="xs" color="primary" onClick={() => setReleasing(h)}>
            Release
          </Button>
        );
      },
    }),
  ];

  return (
    <>
      <ReusableTable
        tableData={rows}
        columns={columns}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
        dense
        compactTitle
        tableTitle={status === "active" ? "Active holds" : status === "released" ? "Released holds" : "All holds"}
        filterDropdowns={[statusFilter]}
      />

      <Modal show={!!releasing} onClose={() => !loading && setReleasing(null)} size="md">
        <Modal.Header>Release withdrawal hold</Modal.Header>
        <Modal.Body>
          {releasing && (
            <div className="flex flex-col gap-3 text-sm">
              <p>
                <span className="font-semibold">{releasing.user?.name || releasing.user?.username || "This user"}</span>{" "}
                will be able to withdraw again.
              </p>
              <p className="text-darklink">
                {num(releasing.shortfall)} coins from a refunded {PROVIDERS[releasing.provider] || releasing.provider}{" "}
                purchase were already spent and weren&apos;t taken back. Releasing doesn&apos;t recover them; it
                only lifts the block. Your name is recorded on the release.
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setReleasing(null)} disabled={loading}>
            Cancel
          </Button>
          <Button color="primary" onClick={release} isProcessing={loading} disabled={loading}>
            Release hold
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default WithdrawalHoldsTable;
