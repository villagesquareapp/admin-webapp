import { getFeedbackSession } from "@/app/api/feedback";
import FeedbackDetail from "./FeedbackDetail";

const Page = async (props: { params: Promise<{ session_id: string }> }) => {
  const params = await props.params;
  const res = await getFeedbackSession(params.session_id);
  return <FeedbackDetail session={res?.data || null} />;
};

export default Page;
