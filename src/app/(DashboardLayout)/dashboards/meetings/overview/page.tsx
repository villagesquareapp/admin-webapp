import { getMeetingsOverview } from "@/app/api/meetings";
import MeetingsOverview from "./MeetingsOverview";

const Page = async () => {
  const res = await getMeetingsOverview();
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-lg font-bold">Meetings</h4>
        <p className="text-sm text-darklink">
          VillageSquare Meet: what&apos;s live now, how meetings went this month, and the AI PM that checks in latecomers.
        </p>
      </div>
      <MeetingsOverview data={res?.data ?? null} message={res?.message} />
    </div>
  );
};

export default Page;
