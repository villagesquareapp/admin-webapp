import { getMentions, getMentionStats } from "@/app/api/discovery";
import MentionsView from "./MentionsView";

const str = (v: string | string[] | undefined) => (typeof v === "string" && v ? v : undefined);

const Page = async (props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  const params = await props.searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 20;
  const [stats, list] = await Promise.all([
    getMentionStats(),
    getMentions({ page, limit, user: str(params.user), role: str(params.role) }),
  ]);
  return (
    <MentionsView
      stats={stats?.data ?? null}
      page={list?.status ? (list.data ?? null) : null}
      error={list && !list.status ? list.message : null}
      currentPage={page}
      pageSize={limit}
    />
  );
};

export default Page;
