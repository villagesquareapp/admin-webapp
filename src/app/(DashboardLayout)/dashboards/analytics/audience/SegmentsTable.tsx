"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import ReusableTable from "@/app/components/shared/ReusableTable";
import { Button } from "@/app/components/shared/Button";
import { createColumnHelper } from "@/utils/table";
import { PUSH_SEND, usePermissions } from "@/utils/permissions";
import SegmentPushComposer from "./SegmentPushComposer";
import { num, pct, share } from "../analyticsUi";

const Reach = ({ n, of }: { n: number; of: number }) => (
  <div className="tabular-nums">
    <p className="text-sm font-semibold">{num(n)}</p>
    <p className="text-[11px] text-darklink">{pct(share(n, of))} of them</p>
  </div>
);

const SegmentsTable = ({ segments, pushStats }: { segments: IAnalyticsSegment[] | null; pushStats: IPushStats | null }) => {
  const { can } = usePermissions();
  const canPush = can(PUSH_SEND);
  const [composing, setComposing] = useState<IAnalyticsSegment | null>(null);

  const col = createColumnHelper<IAnalyticsSegment>();
  const columns = [
    col.accessor("label", {
      header: () => <span>Segment</span>,
      cell: (info) => (
        <div className="max-w-[320px] whitespace-normal">
          <p className="text-sm font-semibold">{info.getValue()}</p>
          <p className="text-xs text-darklink">{info.row.original.description}</p>
        </div>
      ),
    }),
    col.accessor("size", {
      header: () => <span>People</span>,
      cell: (info) => <span className="text-sm font-semibold tabular-nums">{num(info.getValue())}</span>,
    }),
    col.accessor("push_reachable", {
      header: () => <span title="Have a push token refreshed in the last 270 days">Can get a push</span>,
      cell: (info) => <Reach n={info.getValue()} of={info.row.original.size} />,
    }),
    col.accessor("email_reachable", {
      header: () => <span>Have an email</span>,
      cell: (info) => <Reach n={info.getValue()} of={info.row.original.size} />,
    }),
    ...(canPush
      ? [
          col.display({
            id: "send",
            header: () => <span className="sr-only">Send</span>,
            cell: (info) => {
              const s = info.row.original;
              return (
                <div className="flex justify-end">
                  <Button
                    size="xs"
                    color="primary"
                    disabled={!s.push_reachable}
                    title={s.push_reachable ? undefined : "Nobody here has a recent push token"}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      setComposing(s);
                    }}
                  >
                    <Icon icon="solar:plain-2-bold" height={14} className="me-1" /> Send push
                  </Button>
                </div>
              );
            },
          }),
        ]
      : []),
  ];

  return (
    <>
      <ReusableTable
        tableData={segments ?? []}
        columns={columns}
        tableTitle="Win-back segments"
        compactTitle
        paginated={false}
        onRowClick={(row) => canPush && row.push_reachable && setComposing(row)}
        extraButtons={
          <Link href="/dashboards/notifications?audience=segment" className="text-xs font-semibold text-primary flex items-center gap-0.5">
            Segment pushes sent <Icon icon="solar:alt-arrow-right-linear" height={13} />
          </Link>
        }
      />
      {!segments && <p className="text-xs text-error -mt-3 px-1">Segments didn’t load. Refresh the page to try again.</p>}
      <SegmentPushComposer segment={composing} stats={pushStats} onClose={() => setComposing(null)} />
    </>
  );
};

export default SegmentsTable;
