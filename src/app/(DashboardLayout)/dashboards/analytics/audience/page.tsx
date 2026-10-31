import { getAudience, getSegments } from "@/app/api/analytics";
import { getPushStats } from "@/app/api/push-notification";
import AudienceView from "./AudienceView";

const Page = async () => {
  const [audience, segments, stats] = await Promise.all([getAudience(), getSegments(), getPushStats()]);
  return <AudienceView audience={audience?.data ?? null} segments={segments?.data ?? null} pushStats={stats?.data ?? null} />;
};

export default Page;
