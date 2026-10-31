"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Drawer, Spinner } from "flowbite-react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import KpiCard from "@/app/components/shared/KpiCard";
import ReusableTable from "@/app/components/shared/ReusableTable";
import ReasonModal from "@/app/components/shared/ReasonModal";
import { Button } from "@/app/components/shared/Button";
import { createColumnHelper } from "@/utils/table";
import { getHashtag, hideHashtag, restoreHashtag } from "@/app/api/discovery";
import PostSearch from "../../posts/PostSearch";
import { ago, Author, compact, PostSnippet } from "../discoveryUi";

const FILTERS = [
  {
    label: "Status",
    key: "status",
    options: [
      { value: "", label: "All hashtags" },
      { value: "active", label: "Active" },
      { value: "hidden", label: "Hidden" },
    ],
  },
  {
    label: "Sort",
    key: "sort",
    options: [
      { value: "", label: "Most used" },
      { value: "recent", label: "Recently used" },
      { value: "new", label: "Newest" },
    ],
  },
];

const StatusChips = ({ h }: { h: IHashtag }) => (
  <div className="flex flex-wrap gap-1.5">
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${h.deleted_at ? "bg-lighterror text-error" : "bg-lightsuccess text-success"}`}>
      {h.deleted_at ? "Hidden" : "Active"}
    </span>
    {h.off_trending && !h.deleted_at && (
      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-lightwarning text-warning">Off trending</span>
    )}
  </div>
);

const HashtagDrawer = ({ tag, onClose }: { tag: IHashtag | null; onClose: () => void }) => {
  const router = useRouter();
  const [detail, setDetail] = useState<IHashtagDetail | null>(null);
  const [hiding, setHiding] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (!tag) return;
    let live = true;
    setDetail(null);
    getHashtag(tag.uuid).then((r) => live && setDetail(r?.data ?? null));
    return () => {
      live = false;
    };
  }, [tag]);

  if (!tag) return <Drawer open={false} onClose={onClose} position="right" />;
  const h = detail ?? tag;
  const days = detail?.daily_uses ?? [];
  const peak = Math.max(1, ...days.map((d) => d.uses));

  const restore = async () => {
    setRestoring(true);
    const res = await restoreHashtag(tag.uuid);
    setRestoring(false);
    if (!res?.status) return toast.error(res?.message || "That didn’t work");
    toast.success(`#${tag.display_form} is back`);
    onClose();
    router.refresh();
  };

  return (
    <Drawer open={!!tag} onClose={onClose} position="right" className="z-[100] dark:bg-darkgray w-full max-w-[460px] p-0">
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-ld">
          <div className="min-w-0">
            <StatusChips h={h} />
            <h5 className="text-lg font-semibold mt-2 break-all">#{h.display_form}</h5>
            <p className="text-xs text-darklink">
              {compact(h.usage_count)} uses · last used {ago(h.last_used_at)} · first seen {ago(h.created_at)}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-darklink hover:bg-lightgray dark:hover:bg-white/5" aria-label="Close">
            <Icon icon="solar:close-circle-linear" height={22} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
          {!detail ? (
            <div className="flex justify-center py-6"><Spinner size="sm" /></div>
          ) : (
            <>
              <div className="rounded-xl border border-ld p-4">
                <p className="text-sm font-semibold mb-3">Posts using it, last 30 days</p>
                {days.length ? (
                  <div className="flex items-end gap-1 h-20">
                    {days.map((d) => (
                      <div key={d.day} title={`${d.day}: ${d.uses}`} className="flex-1 bg-primary/80 rounded-t" style={{ height: `${Math.max(6, (100 * d.uses) / peak)}%` }} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-darklink">Not used in the last 30 days.</p>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">Recent posts</p>
                <div className="flex flex-col gap-3">
                  {detail.recent_posts.map((p) => (
                    <div key={p.uuid} className="rounded-xl border border-ld p-3 flex flex-col gap-2">
                      <Author author={p.author} anonymous={p.is_anonymous} />
                      <PostSnippet post={p} />
                      <p className="text-[11px] text-darklink">{compact(p.likes)} likes · {compact(p.replies)} replies · {ago(p.created_at)}</p>
                    </div>
                  ))}
                  {!detail.recent_posts.length && <p className="text-sm text-darklink">No posts use it right now.</p>}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2 px-5 py-4 border-t border-ld">
          {h.deleted_at ? (
            <Button color="success" size="sm" onClick={restore} disabled={restoring}>
              {restoring && <Spinner size="sm" light />}
              <Icon icon="solar:restart-linear" height={16} className="me-1" /> Restore hashtag
            </Button>
          ) : (
            <Button color="failure" size="sm" onClick={() => setHiding(true)}>
              <Icon icon="solar:eye-closed-linear" height={16} className="me-1" /> Hide hashtag
            </Button>
          )}
        </div>
      </div>
      <ReasonModal
        open={hiding}
        title={`Hide #${tag.display_form}?`}
        text="It stops showing in search suggestions and hashtag pages, new posts won’t link to it, and it comes off trending. Posts keep their text. You can restore it."
        confirmLabel="Hide hashtag"
        icon="solar:eye-closed-bold-duotone"
        onClose={() => setHiding(false)}
        onConfirm={async (reason) => {
          const res = await hideHashtag(tag.uuid, reason);
          if (!res?.status) {
            toast.error(res?.message || "That didn’t work");
            return false;
          }
          toast.success(`#${tag.display_form} is hidden`);
          onClose();
          router.refresh();
        }}
      />
    </Drawer>
  );
};

const HashtagsView = ({
  stats,
  page,
  currentPage,
  pageSize,
}: {
  stats: IHashtagStats | null;
  page: IPaginatedResponse<IHashtag> | null;
  currentPage: number;
  pageSize: number;
}) => {
  const [open, setOpen] = useState<IHashtag | null>(null);
  const col = createColumnHelper<IHashtag>();
  const columns = [
    col.accessor("display_form", {
      header: () => <span>Hashtag</span>,
      cell: (i) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="size-8 rounded-lg grid place-items-center bg-lightprimary text-primary shrink-0">
            <Icon icon="solar:hashtag-linear" height={16} />
          </span>
          <p className="text-sm font-medium truncate max-w-[220px]">#{i.getValue()}</p>
        </div>
      ),
    }),
    col.accessor("usage_count", {
      header: () => <span>Uses</span>,
      cell: (i) => <span className="text-sm font-semibold tabular-nums">{compact(i.getValue())}</span>,
    }),
    col.accessor("last_used_at", {
      header: () => <span>Last used</span>,
      cell: (i) => <span className="text-sm text-darklink whitespace-nowrap">{ago(i.getValue())}</span>,
    }),
    col.accessor("created_at", {
      header: () => <span>First seen</span>,
      cell: (i) => <span className="text-sm text-darklink whitespace-nowrap">{ago(i.getValue())}</span>,
    }),
    col.display({
      id: "status",
      header: () => <span>Status</span>,
      cell: (i) => <StatusChips h={i.row.original} />,
    }),
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h4 className="text-lg font-bold">Hashtags</h4>
        <p className="text-sm text-darklink">Every hashtag people use. Hide one that’s abusive or spam: it disappears from suggestions, hashtag pages and trending.</p>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard icon="solar:hashtag-bold-duotone" value={stats.total} label="Hashtags" tone="bg-lightprimary text-primary" />
            <KpiCard icon="solar:fire-bold-duotone" value={stats.used_24h} label="Used in the last 24h" tone="bg-lightwarning text-warning" />
            <KpiCard icon="solar:star-bold-duotone" value={stats.new_7d} label="New this week" tone="bg-lightsecondary text-secondary" />
            <KpiCard icon="solar:eye-closed-bold-duotone" value={stats.hidden} label="Hidden" tone="bg-lighterror text-error" />
          </div>
          {stats.top_this_week.length > 0 && (
            <CardBox>
              <h5 className="text-sm font-semibold mb-3">Most used, active this week</h5>
              <div className="flex flex-wrap gap-2">
                {stats.top_this_week.map((t) => (
                  <span key={t.uuid} className="inline-flex items-center gap-1.5 rounded-full border border-ld px-3 py-1.5 text-sm">
                    <span className="font-medium">#{t.display_form}</span>
                    <span className="text-xs text-darklink">{compact(t.usage_count)}</span>
                  </span>
                ))}
              </div>
            </CardBox>
          )}
        </>
      )}

      <ReusableTable
        tableData={page?.data ?? []}
        columns={columns}
        totalPages={page?.last_page || 1}
        currentPage={currentPage}
        pageSize={pageSize}
        dense
        compactTitle
        tableTitle="All hashtags"
        filterDropdowns={FILTERS}
        extraButtons={<PostSearch placeholder="Search hashtags…" />}
        onRowClick={(row: IHashtag) => setOpen(row)}
      />
      <HashtagDrawer tag={open} onClose={() => setOpen(null)} />
    </div>
  );
};

export default HashtagsView;
