"use client";

import { useTransition } from "react";
import Image from "next/image";
import { createColumnHelper } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import { Dropdown } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { toast } from "sonner";
import ReusableTable from "@/app/components/shared/ReusableTable";
import { moderateTemplate } from "@/app/api/vflix-catalog";
import { formatCount } from "../vflixStatus";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-lightwarning text-warning",
  approved: "bg-lightprimary text-primary",
  rejected: "bg-lighterror text-error",
};

const TemplatesView = ({
  templates,
  totalPages,
  currentPage,
  pageSize,
}: {
  templates: IVflixTemplate[];
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  const [pending, startTransition] = useTransition();

  const act = (t: IVflixTemplate, action: "approve" | "reject" | "remove") =>
    startTransition(async () => {
      const res = await moderateTemplate(t.id, action);
      if (res?.status) toast.success(`Template ${action}d`);
      else toast.error(res?.message || "Failed");
    });

  const col = createColumnHelper<IVflixTemplate>();
  const columns = [
    col.accessor("name", {
      header: () => <span>Template</span>,
      cell: (info) => (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-[52px] rounded-md overflow-hidden bg-muted dark:bg-dark shrink-0">
            <Image src={info.row.original.cover} alt="" fill className="object-cover" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{info.getValue()}</p>
            <p className="text-xs text-darklink truncate">{info.row.original.category}</p>
          </div>
        </div>
      ),
    }),
    col.accessor("submitted_by", {
      header: () => <span>Submitted by</span>,
      cell: (info) => <span className="text-sm text-darklink">@{info.getValue()}</span>,
    }),
    col.accessor("status", {
      header: () => <span>Status</span>,
      cell: (info) => (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[info.getValue()]}`}>
          {info.getValue()}
        </span>
      ),
    }),
    col.accessor("uses_count", {
      header: () => <span>Uses</span>,
      cell: (info) => <span className="text-sm font-semibold tabular-nums">{formatCount(info.getValue())}</span>,
    }),
    col.display({
      id: "actions",
      header: () => <span>Actions</span>,
      cell: (info) => {
        const t = info.row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            {t.status === "pending" && (
              <>
                <button
                  onClick={() => act(t, "approve")}
                  disabled={pending}
                  className="flex items-center gap-1 text-xs font-semibold bg-lightsuccess text-success px-2.5 py-1.5 rounded-md disabled:opacity-50"
                >
                  <Icon icon="solar:check-circle-bold" height={15} /> Approve
                </button>
                <button
                  onClick={() => act(t, "reject")}
                  disabled={pending}
                  className="flex items-center gap-1 text-xs font-semibold bg-lighterror text-error px-2.5 py-1.5 rounded-md disabled:opacity-50"
                >
                  <Icon icon="solar:close-circle-bold" height={15} /> Reject
                </button>
              </>
            )}
            <Dropdown
              label=""
              inline
              renderTrigger={() => (
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                  <HiOutlineDotsVertical />
                </button>
              )}
            >
              <Dropdown.Item onClick={() => toast.info("Preview — coming with backend")}>Preview</Dropdown.Item>
              {t.status !== "approved" && <Dropdown.Item onClick={() => act(t, "approve")}>Approve</Dropdown.Item>}
              {t.status !== "rejected" && <Dropdown.Item onClick={() => act(t, "reject")}>Reject</Dropdown.Item>}
              <Dropdown.Item onClick={() => act(t, "remove")}>Remove</Dropdown.Item>
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
      { value: "pending", label: "Pending review" },
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" },
    ],
  };

  return (
    <ReusableTable
      tableData={templates}
      columns={columns}
      totalPages={totalPages}
      currentPage={currentPage}
      pageSize={pageSize}
      dense
      tableTitle="Templates"
      filterDropdowns={[statusFilter]}
      extraButtons={
        <button
          onClick={() => toast.info("New template — coming with backend")}
          className="flex items-center gap-2 text-sm font-semibold bg-primary text-white px-3.5 py-2 rounded-md"
        >
          <Icon icon="solar:add-circle-linear" height={17} /> New template
        </button>
      }
    />
  );
};

export default TemplatesView;
