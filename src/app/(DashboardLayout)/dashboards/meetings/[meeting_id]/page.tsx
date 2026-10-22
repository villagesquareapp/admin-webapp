import { getMeeting } from "@/app/api/meetings";
import CardBox from "@/app/components/shared/CardBox";
import MeetingDetail from "./MeetingDetail";

const Page = async (props: { params: Promise<{ meeting_id: string }> }) => {
  const params = await props.params;
  const res = await getMeeting(params.meeting_id);
  if (!res?.data) {
    return (
      <CardBox>
        <p className="py-10 text-center text-sm text-darklink">{res?.message || "Couldn't load this meeting."}</p>
      </CardBox>
    );
  }
  return <MeetingDetail meeting={res.data} />;
};

export default Page;
