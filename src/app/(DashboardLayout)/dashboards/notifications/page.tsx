import { getToken } from "@/lib/getToken";
import PushNotification from "./PushNotification";
import { getPushNotifications } from "@/app/api/push-notification";

const Page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const token = await getToken();
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;

  const [notifications] = await Promise.all([getPushNotifications(page, limit)]);

  if (!token) throw new Error("No token found");

  return (
    <>
      <div>
        <PushNotification
          notifications={notifications?.data || null}
          totalPages={notifications?.data?.last_page || 1}
          currentPage={page}
          pageSize={limit}
        />
      </div>
    </>
  );
};

export default Page;
