import { getMeetingAssistant, getMeetingAssistantUsage } from "@/app/api/meetings";
import AssistantContent from "./AssistantContent";

const Page = async ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
  const days = [7, 30, 90].includes(Number(searchParams.days)) ? Number(searchParams.days) : 30;
  const [settings, usage] = await Promise.all([getMeetingAssistant(), getMeetingAssistantUsage(days)]);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-lg font-bold">AI PM</h4>
        <p className="text-sm text-darklink">
          The meeting PM checks in anyone who joins late: it pauses the meeting, asks why, replies, and hands back to
          the speaker. Hosts switch it on per meeting; this is the switch for every meeting.
        </p>
      </div>
      <AssistantContent settings={settings?.data ?? null} usage={usage?.data ?? null} days={days} />
    </div>
  );
};

export default Page;
