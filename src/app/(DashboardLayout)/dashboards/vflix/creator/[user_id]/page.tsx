import { Suspense } from "react";
import { getVflixByCreator } from "@/app/api/vflix";
import VflixBreadcrumb from "../../VflixBreadcrumb";
import CreatorView from "./CreatorView";

const CreatorWrapper = async ({
  userId,
  page,
  limit,
}: {
  userId: string;
  page: number;
  limit: number;
}) => {
  const res = await getVflixByCreator(userId, page, limit);
  return <CreatorView data={res?.data || null} page={page} limit={limit} />;
};

const Page = async ({
  params,
  searchParams,
}: {
  params: { user_id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const userId = params.user_id;
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;

  const BCrumb = [
    { to: "/", title: "Home" },
    { to: "/dashboards/vflix", title: "VFlix" },
    { title: "Creator" },
  ];

  return (
    <>
      <VflixBreadcrumb title="Creator" items={BCrumb} backTo="/dashboards/vflix" />
      <Suspense
        key={`${userId}-${page}-${limit}`}
        fallback={<div className="h-[600px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
      >
        <CreatorWrapper userId={userId} page={page} limit={limit} />
      </Suspense>
    </>
  );
};

export default Page;
