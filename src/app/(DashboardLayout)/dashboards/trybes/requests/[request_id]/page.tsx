import { Suspense } from "react";
import { getJoinRequest } from "@/app/api/trybes";
import JoinRequestReview from "./JoinRequestReview";

const Wrapper = async ({ id }: { id: string }) => {
  const res = await getJoinRequest(id);
  return <JoinRequestReview request={res?.data ?? null} />;
};

const Page = async (props: { params: Promise<{ request_id: string }> }) => {
  const params = await props.params;
  return (
    <Suspense
      key={params.request_id}
      fallback={<div className="h-[600px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
    >
      <Wrapper id={params.request_id} />
    </Suspense>
  );
};

export default Page;
