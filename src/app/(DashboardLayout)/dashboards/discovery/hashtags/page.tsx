import { getHashtags, getHashtagStats } from "@/app/api/discovery";
import HashtagsView from "./HashtagsView";

const str = (v: string | string[] | undefined) => (typeof v === "string" && v ? v : undefined);

const Page = async (props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  const params = await props.searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 20;
  const [stats, list] = await Promise.all([
    getHashtagStats(),
    getHashtags({ page, limit, search: str(params.search), status: str(params.status), sort: str(params.sort) }),
  ]);
  return <HashtagsView stats={stats?.data ?? null} page={list?.data ?? null} currentPage={page} pageSize={limit} />;
};

export default Page;
