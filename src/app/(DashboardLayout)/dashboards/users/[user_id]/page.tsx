import { Suspense } from "react";
import { getUserDetails } from "@/app/api/user";
import UserDetailContent from "./UserDetailContent";

const Wrapper = async ({ id }: { id: string }) => {
  const res = await getUserDetails(id);
  return <UserDetailContent detail={res?.data?.user_details ?? null} userId={id} />;
};

const Page = ({ params }: { params: { user_id: string } }) => (
  <Suspense
    key={params.user_id}
    fallback={<div className="h-[600px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
  >
    <Wrapper id={params.user_id} />
  </Suspense>
);

export default Page;
