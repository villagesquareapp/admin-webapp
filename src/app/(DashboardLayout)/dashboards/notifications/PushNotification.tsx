"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/app/components/shared/Button";
import ReusableTable from "@/app/components/shared/ReusableTable";
import { createColumnHelper } from "@/utils/table";
import VflixSearch from "../vflix/VflixSearch";
import SuiteHeader from "../business-suite/SuiteHeader";
import Actions from "./Actions";
import PushComposer, { ComposerDraft } from "./PushComposer";
import PushDetail from "./PushDetail";
import {
  audienceLabel,
  audienceOf,
  AUDIENCES,
  compact,
  formatDateTime,
  relative,
  STATUS_LABEL,
  STATUS_TONE,
  whenOf,
} from "./pushUi";

const FILTERS = [
  {
    label: "Status",
    key: "status",
    defaultValue: "",
    options: [
      { value: "", label: "All statuses" },
      ...Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label })),
    ],
  },
  {
    label: "Audience",
    key: "audience",
    defaultValue: "",
    options: [{ value: "", label: "All audiences" }, ...AUDIENCES.map((a) => ({ value: a.value, label: a.label }))],
  },
];

const Delivery = ({ n }: { n: IPushNotifications }) => {
  const ok = n.success_count ?? 0;
  const bad = n.failure_count ?? 0;
  if (n.status === "scheduled" || n.status === "cancelled") return <span className="text-xs text-darklink">—</span>;
  if (n.status === "failed" && !ok) {
    return <span className="text-xs text-error line-clamp-1 max-w-[180px]" title={n.error ?? ""}>{n.error || "Not sent"}</span>;
  }
  if (audienceOf(n) === "all") return <span className="text-xs text-darklink">All subscribed devices</span>;
  if (!ok && !bad) return <span className="text-xs text-darklink">{n.status === "sending" ? "Going out…" : "—"}</span>;
  return (
    <div className="w-36">
      <div className="h-1.5 rounded-full bg-lighterror overflow-hidden">
        <div className="h-full bg-success" style={{ width: `${(100 * ok) / (ok + bad)}%` }} />
      </div>
      <p className="text-[11px] text-darklink mt-1">
        <span className="text-success font-semibold">{compact(ok)}</span> reached
        {bad ? <> · <span className="text-error font-semibold">{compact(bad)}</span> refused</> : null}
      </p>
    </div>
  );
};

const PushNotification = ({
  notifications,
  stats,
  statsRow,
  totalPages,
  currentPage,
  pageSize,
}: {
  notifications: IPushNotificationResponse | null;
  stats: IPushStats | null;
  statsRow?: React.ReactNode;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  const [composer, setComposer] = useState<{ draft: ComposerDraft | null } | null>(null);
  const [viewing, setViewing] = useState<IPushNotifications | null>(null);

  const duplicate = (n: IPushNotifications | IPushDetail) => {
    setViewing(null);
    setComposer({
      draft: {
        title: n.title,
        body: n.body,
        image_url: n.image_url,
        audience: audienceOf(n),
        users: "recipients" in n ? n.recipients : [],
      },
    });
  };

  const col = createColumnHelper<IPushNotifications>();
  const columns = [
    col.accessor("title", {
      header: () => <span>Push</span>,
      cell: (info) => {
        const n = info.row.original;
        return (
          <div className="flex items-start gap-3 max-w-[340px]">
            {n.image_url ? (
              <img src={n.image_url} alt="" className="size-10 rounded-lg object-cover shrink-0" />
            ) : (
              <span className="size-10 rounded-lg bg-lightprimary text-primary grid place-items-center shrink-0">
                <Icon icon="solar:bell-bing-bold-duotone" height={20} />
              </span>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{n.title}</p>
              <p className="text-xs text-darklink line-clamp-2 break-words">{n.body}</p>
            </div>
          </div>
        );
      },
    }),
    col.display({
      id: "audience",
      header: () => <span>Audience</span>,
      cell: (info) => {
        const a = AUDIENCES.find((x) => x.value === audienceOf(info.row.original))!;
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-darklink whitespace-nowrap">
            <Icon icon={a.icon} height={16} />
            {audienceLabel(info.row.original)}
          </span>
        );
      },
    }),
    col.accessor("status", {
      header: () => <span>Status</span>,
      cell: (info) => {
        const s = info.getValue();
        return (
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_TONE[s] || "bg-lightgray text-darklink"}`}>
            {s === "sending" && <Icon icon="svg-spinners:180-ring" height={12} />}
            {STATUS_LABEL[s] || s}
          </span>
        );
      },
    }),
    col.display({
      id: "delivery",
      header: () => <span>Delivery</span>,
      cell: (info) => <Delivery n={info.row.original} />,
    }),
    col.display({
      id: "when",
      header: () => <span>When</span>,
      cell: (info) => {
        const n = info.row.original;
        const at = whenOf(n);
        return (
          <div className="whitespace-nowrap">
            <p className="text-sm">{formatDateTime(at)}</p>
            <p className="text-[11px] text-darklink">
              {n.status === "scheduled" ? `goes out ${relative(at)}` : relative(at)}
              {n.sent_by_name ? ` · ${n.sent_by_name}` : ""}
            </p>
          </div>
        );
      },
    }),
    col.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: (info) => (
        <Actions
          notification={info.row.original}
          onView={() => setViewing(info.row.original)}
          onDuplicate={() => duplicate(info.row.original)}
        />
      ),
    }),
  ];

  return (
    <div className="flex flex-col gap-5">
      <SuiteHeader
        title="Push Notifications"
        subtitle="Send or schedule pushes to everyone, one platform or chosen users, and see what reached people."
        back="/dashboards/business-suite"
        actions={
          <Button color="primary" className="h-10 whitespace-nowrap" onClick={() => setComposer({ draft: null })}>
            <Icon icon="solar:add-circle-bold" height={18} className="me-1" /> New push
          </Button>
        }
      />
      {statsRow}
      <ReusableTable
        tableData={Array.isArray(notifications?.data) ? notifications!.data : []}
        columns={columns}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
        tableTitle="Push history"
        filterDropdowns={FILTERS}
        onRowClick={(row) => setViewing(row)}
        extraButtons={<VflixSearch placeholder="Search title or message…" />}
      />

      <PushComposer
        isOpen={!!composer}
        draft={composer?.draft ?? null}
        stats={stats}
        onClose={() => setComposer(null)}
      />
      <PushDetail row={viewing} onClose={() => setViewing(null)} onDuplicate={duplicate} />
    </div>
  );
};

export default PushNotification;
