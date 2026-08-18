import { Suspense } from "react";
import { getToken } from "@/lib/getToken";
import PushNotification from "./PushNotification";
import { getPushNotifications } from "@/app/api/push-notification";

const NotificationsWrapper = async ({
  page,
  limit
}: {
  page: number;
  limit: number;
}) => {
  const notifications = await getPushNotifications(page, limit);
  return (
    <PushNotification
      notifications={notifications?.data || null}
      totalPages={notifications?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
    />
  );
};

const Page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const token = await getToken();
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;

  if (!token) throw new Error("No token found");

  return (
    <Suspense key={`${page}-${limit}`} fallback={<div className="h-[600px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
      <NotificationsWrapper page={page} limit={limit} />
    </Suspense>
  );
};

export default Page;
