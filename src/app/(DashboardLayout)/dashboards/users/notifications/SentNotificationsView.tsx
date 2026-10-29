"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import KpiCard from "@/app/components/shared/KpiCard";
import ReusableTable from "@/app/components/shared/ReusableTable";
import ReasonModal from "@/app/components/shared/ReasonModal";
import UserLookupInput from "@/app/components/shared/UserLookupInput";
import { createColumnHelper } from "@/utils/table";
import { removeSentNotification } from "@/app/api/notification-log";
import { PersonCell } from "../../meetings/meetingsUi";
import { ago, dateTime } from "../../discovery/discoveryUi";
import { NOTIFICATION_TYPE_LABEL, typeLabel } from "./notificationTypes";

// What the notification said: its own message, or the most telling data field.
const summary = (n: ISentNotification) =>
  n.message ||
  n.data?.body ||
  n.data?.title ||
  n.data?.name ||
  n.data?.challenge_name ||
  n.data?.round_name ||
  (n.data ? Object.entries(n.data).slice(0, 2).map(([k, v]) => `${k}: ${String(v)}`).join(" · ") : "—");

const SentNotificationsView = ({
  page,
  error,
  currentPage,
  pageSize,
}: {
  page: ISentNotificationsPage | null;
  error?: string | null;
  currentPage: number;
  pageSize: number;
}) => {
  const router = useRouter();
  const [removing, setRemoving] = useState<ISentNotification | null>(null);
  const col = createColumnHelper<ISentNotification>();
  const columns = [
    col.accessor("type", {
      header: () => <span>Notification</span>,
      cell: (i) => (
        <div className="min-w-0 max-w-[340px]">
          <p className="text-sm font-medium">{typeLabel(i.getValue())}</p>
          <p className="text-xs text-darklink line-clamp-2 break-words">{summary(i.row.original)}</p>
        </div>
      ),
    }),
    col.display({
      id: "from",
      header: () => <span>From</span>,
      cell: (i) =>
        i.row.original.initiator_anonymous ? (
          <span className="text-sm text-darklink">Anonymous</span>
        ) : i.row.original.initiator ? (
          <PersonCell person={i.row.original.initiator} />
        ) : (
          <span className="text-sm text-darklink">VillageSquare</span>
        ),
    }),
    col.accessor("is_read", {
      header: () => <span>Read</span>,
      cell: (i) => (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${i.getValue() ? "bg-lightgray dark:bg-white/5 text-darklink" : "bg-lightprimary text-primary"}`}>
          {i.getValue() ? "Read" : "Unread"}
        </span>
      ),
    }),
    col.accessor("created_at", {
      header: () => <span>Sent</span>,
      cell: (i) => (
        <span className="text-sm text-darklink whitespace-nowrap" title={dateTime(i.getValue())}>
          {ago(i.getValue())}
        </span>
      ),
    }),
    col.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: (i) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setRemoving(i.row.original);
          }}
          className="text-xs font-semibold text-error hover:bg-lighterror px-2.5 py-1.5 rounded-md whitespace-nowrap"
        >
          Remove
        </button>
      ),
    }),
  ];

  const user = page?.user;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h4 className="text-lg font-bold">Notifications sent</h4>
          <p className="text-sm text-darklink">Look someone up to see every in-app notification they were sent, when, and whether they read it.</p>
        </div>
        <UserLookupInput />
      </div>

      {error && (
        <CardBox>
          <p className="text-sm text-error flex items-center gap-2">
            <Icon icon="solar:danger-circle-linear" height={18} /> {error}
          </p>
        </CardBox>
      )}

      {!user && !error && (
        <CardBox>
          <div className="py-14 text-center">
            <span className="mx-auto size-14 rounded-full grid place-items-center bg-lightprimary text-primary">
              <Icon icon="solar:bell-search-bold-duotone" height={28} />
            </span>
            <p className="text-base font-semibold mt-3">Look someone up</p>
            <p className="text-sm text-darklink mt-1">Enter a username, email or user id above.</p>
          </div>
        </CardBox>
      )}

      {user && page && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-5">
            <CardBox className="flex flex-col gap-4">
              <PersonCell person={user} />
              <div className="grid grid-cols-2 gap-3">
                <KpiCard icon="solar:bell-bold-duotone" value={page.summary.total} label="Notifications" tone="bg-lightprimary text-primary" />
                <KpiCard icon="solar:bell-bing-bold-duotone" value={page.summary.unread} label="Unread" tone="bg-lightwarning text-warning" />
              </div>
              <p className="text-xs text-darklink">Last one {ago(page.summary.last_at)}</p>
            </CardBox>
            <CardBox>
              <h5 className="text-sm font-semibold mb-3">Last 30 days by kind</h5>
              <div className="flex flex-wrap gap-2">
                {page.summary.by_type_30d.map((t) => (
                  <span key={t.type} className="text-xs rounded-full border border-ld px-3 py-1">
                    {typeLabel(t.type)} <span className="font-semibold">{t.count}</span>
                  </span>
                ))}
                {!page.summary.by_type_30d.length && <p className="text-sm text-darklink">Nothing in the last 30 days.</p>}
              </div>
            </CardBox>
          </div>

          <ReusableTable
            tableData={page.data ?? []}
            columns={columns}
            totalPages={page.last_page || 1}
            currentPage={currentPage}
            pageSize={pageSize}
            dense
            compactTitle
            tableTitle={`@${user.username ?? user.name}’s notifications`}
            filterDropdowns={[
              {
                label: "Kind",
                key: "type",
                options: [
                  { value: "", label: "Every kind" },
                  ...page.summary.by_type_30d
                    .map((t) => t.type)
                    .concat(Object.keys(NOTIFICATION_TYPE_LABEL))
                    .filter((t, i, all) => all.indexOf(t) === i)
                    .map((t) => ({ value: t, label: typeLabel(t) })),
                ],
              },
              {
                label: "Read",
                key: "read",
                options: [
                  { value: "", label: "Read and unread" },
                  { value: "false", label: "Unread" },
                  { value: "true", label: "Read" },
                ],
              },
            ]}
          />
        </>
      )}

      <ReasonModal
        open={!!removing}
        title="Remove this notification?"
        text="It disappears from their notifications. Use it for one sent by mistake."
        subject={removing ? typeLabel(removing.type) : undefined}
        confirmLabel="Remove"
        icon="solar:bell-off-bold-duotone"
        onClose={() => setRemoving(null)}
        onConfirm={async (reason) => {
          if (!removing) return;
          const res = await removeSentNotification(removing.uuid, reason);
          if (!res?.status) {
            toast.error(res?.message || "That didn’t work");
            return false;
          }
          toast.success("Notification removed");
          router.refresh();
        }}
      />
    </div>
  );
};

export default SentNotificationsView;
