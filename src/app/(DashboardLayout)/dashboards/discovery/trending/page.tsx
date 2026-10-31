import { getTrending } from "@/app/api/discovery";
import TrendingView from "./TrendingView";

const Page = async (props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  const params = await props.searchParams;
  const win = typeof params.window === "string" && ["1h", "24h", "7d"].includes(params.window) ? params.window : "24h";
  const res = await getTrending(win);
  return <TrendingView data={res?.data ?? null} />;
};

export default Page;
