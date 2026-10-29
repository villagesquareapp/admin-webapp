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
import { removeMention } from "@/app/api/discovery";
import { PersonCell } from "../../meetings/meetingsUi";
import { ago, Author, Leaderboard, PostSnippet } from "../discoveryUi";

const MentionsView = ({
  stats,
  page,
  currentPage,
  pageSize,
  error,
}: {
  stats: IMentionStats | null;
  page: (IPaginatedResponse<IMention> & { user: IUserBrief | null }) | null;
  currentPage: number;
  pageSize: number;
  error?: string | null;
}) => {
  const router = useRouter();
  const [removing, setRemoving] = useState<IMention | null>(null);
  const col = createColumnHelper<IMention>();
  const columns = [
    col.accessor("created_at", {
      header: () => <span>When</span>,
      cell: (i) => <span className="text-sm text-darklink whitespace-nowrap">{ago(i.getValue())}</span>,
    }),
    col.display({
      id: "author",
      header: () => <span>Mentioned by</span>,
      cell: (i) => <Author author={i.row.original.author} anonymous={i.row.original.is_anonymous} />,
    }),
    col.display({
      id: "mentioned",
      header: () => <span>Mentioned</span>,
      cell: (i) => <PersonCell person={i.row.original.mentioned_user} />,
    }),
    col.display({
      id: "post",
      header: () => <span>In</span>,
      cell: (i) => (
        <PostSnippet post={{ uuid: i.row.original.post_id, caption: i.row.original.caption, status: i.row.original.post_status }} comment={i.row.original.is_comment} />
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

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h4 className="text-lg font-bold">Mentions</h4>
          <p className="text-sm text-darklink">Who’s tagging whom. Look for pile-ons and mention spam, and take a mention out of someone’s Mentions tab.</p>
        </div>
        <UserLookupInput placeholder="One person: username or email" label="Show" />
      </div>

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,240px)_1fr_1fr] gap-5">
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 content-start">
            <KpiCard icon="solar:mention-circle-bold-duotone" value={stats.last_24h} label="Mentions in 24h" tone="bg-lightprimary text-primary" />
            <KpiCard icon="solar:calendar-bold-duotone" value={stats.last_7d} label="Mentions in 7 days" tone="bg-lightsecondary text-secondary" />
          </div>
          <CardBox>
            <Leaderboard title="Most mentioned this week" hint="A sudden spike can mean a pile-on." rows={stats.most_mentioned} />
          </CardBox>
          <CardBox>
            <Leaderboard
              title="Mentioning the most"
              hint="Many mentions to many people can mean spam."
              rows={stats.top_mentioners.map((r) => ({ ...r, sub: `to ${r.people} ${r.people === 1 ? "person" : "people"}` }))}
            />
          </CardBox>
        </div>
      )}

      {error ? (
        <CardBox>
          <p className="text-sm text-error flex items-center gap-2">
            <Icon icon="solar:danger-circle-linear" height={18} /> {error}
          </p>
        </CardBox>
      ) : (
        <ReusableTable
          tableData={page?.data ?? []}
          columns={columns}
          totalPages={page?.last_page || 1}
          currentPage={currentPage}
          pageSize={pageSize}
          dense
          compactTitle
          tableTitle={page?.user ? `@${page.user.username ?? page.user.name}’s mentions` : "Mentions, last 7 days"}
          filterDropdowns={
            page?.user
              ? [
                  {
                    label: "Role",
                    key: "role",
                    options: [
                      { value: "", label: "Made or received" },
                      { value: "mentioned", label: "Received" },
                      { value: "author", label: "Made" },
                    ],
                  },
                ]
              : undefined
          }
        />
      )}

      <ReasonModal
        open={!!removing}
        title="Remove this mention?"
        text="The post comes out of the person’s Mentions tab. The post itself stays."
        subject={removing?.caption ?? undefined}
        confirmLabel="Remove mention"
        icon="solar:mention-circle-bold-duotone"
        onClose={() => setRemoving(null)}
        onConfirm={async (reason) => {
          if (!removing) return;
          const res = await removeMention(removing.uuid, reason);
          if (!res?.status) {
            toast.error(res?.message || "That didn’t work");
            return false;
          }
          toast.success("Mention removed");
          router.refresh();
        }}
      />
    </div>
  );
};

export default MentionsView;
