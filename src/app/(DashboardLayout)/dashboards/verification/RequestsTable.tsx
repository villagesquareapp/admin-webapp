"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "flowbite-react";
import { toast } from "sonner";
import ReusableTable from "@/app/components/shared/ReusableTable";
import { createColumnHelper } from "@/utils/table";
import { getUserDetails } from "@/app/api/user";
import { getVerificationRequested } from "@/app/api/pending-verification";
import PendingVerificationDialog from "../../PendingVerificationDialog";
import PostSearch from "../posts/PostSearch";
import { PersonCell, VerifiedBadge, shortDate } from "./verificationUi";

const STATUS_COLOR: Record<string, string> = { pending: "warning", approved: "success", rejected: "failure" };

// People who paid for a badge and sent their documents. A row opens the
// review (documents open through logged links).
const RequestsTable = ({
  requests,
  status,
  totalPages,
  currentPage,
  pageSize,
}: {
  requests: IPendingVerificationResponse | null;
  status: string;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  const router = useRouter();
  const rows = Array.isArray(requests?.data) ? requests!.data : [];
  const [selected, setSelected] = useState<IPendingVerification | null>(null);
  const [user, setUser] = useState<IUser | null>(null);
  const [detail, setDetail] = useState<IVerificationRequested | null>(null);
  const [loading, setLoading] = useState(false);
  const col = createColumnHelper<IPendingVerification>();

  const open = async (row: IPendingVerification) => {
    setSelected(row);
    setUser(null);
    setDetail(null);
    setLoading(true);
    try {
      const [u, d] = await Promise.all([getUserDetails(row.user.uuid), getVerificationRequested(row.uuid)]);
      if (u?.data) setUser(u.data as unknown as IUser);
      if (d?.data) setDetail(d.data as unknown as IVerificationRequested);
    } catch {
      toast.error("Couldn't load the request");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    col.accessor((r) => r.user?.name, {
      id: "person",
      header: () => <span>Person</span>,
      cell: (info) => <PersonCell user={info.row.original.user} />,
    }),
    col.accessor((r) => r.subscription?.plan?.badge_type, {
      id: "badge",
      header: () => <span>Asked for</span>,
      cell: (info) => {
        const r = info.row.original;
        return (
          <div className="flex flex-col gap-1">
            <VerifiedBadge badge={r.subscription?.plan?.badge_type} />
            <span className="text-xs text-darklink">{r.subscription?.plan?.name}</span>
          </div>
        );
      },
    }),
    col.accessor("documents_count", {
      header: () => <span>Documents</span>,
      cell: (i) => <span className="text-sm tabular-nums">{i.getValue() ?? "--"}</span>,
    }),
    col.accessor("created_at", {
      header: () => <span>Sent</span>,
      cell: (i) => <span className="text-sm text-darklink">{shortDate(i.getValue())}</span>,
    }),
    col.accessor("status", {
      header: () => <span>Status</span>,
      cell: (info) => {
        const r = info.row.original;
        return (
          <div className="text-xs text-darklink">
            <Badge color={STATUS_COLOR[r.status] ?? "gray"} className="w-fit capitalize mb-1">
              {r.status}
            </Badge>
            {r.reviewed_at && (
              <p>
                {shortDate(r.reviewed_at)}
                {r.reviewer?.name ? ` by ${r.reviewer.name}` : ""}
              </p>
            )}
            {r.status === "rejected" && r.admin_comments && <p className="max-w-[220px] truncate">&ldquo;{r.admin_comments}&rdquo;</p>}
          </div>
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
        onRowClick={open}
        tableTitle={status === "pending" ? "Waiting for review (oldest first)" : status === "approved" ? "Approved" : "Rejected"}
        filterDropdowns={[
          {
            label: "Status",
            key: "status",
            options: [
              { value: "pending", label: "Waiting" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
            ],
            defaultValue: status,
          },
        ]}
        extraButtons={<PostSearch placeholder="Search name or username..." />}
      />
      {rows.length === 0 && (
        <p className="text-sm text-darklink text-center -mt-2 mb-4">
          {status === "pending" ? "No requests waiting. All caught up." : "Nothing here yet."}
        </p>
      )}
      <PendingVerificationDialog
        isOpen={!!selected}
        setIsOpen={() => setSelected(null)}
        pendingVerification={selected}
        currentSelectedUser={user}
        currentSelectedVerificationRequested={detail}
        onVerificationUpdate={() => router.refresh()}
        isLoadingDetails={loading}
      />
    </>
  );
};

export default RequestsTable;
