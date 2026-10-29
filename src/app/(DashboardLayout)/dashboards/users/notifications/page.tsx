import { getSentNotifications } from "@/app/api/notification-log";
import SentNotificationsView from "./SentNotificationsView";

const str = (v: string | string[] | undefined) => (typeof v === "string" && v ? v : undefined);

const Page = async (props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  const params = await props.searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 20;
  const user = str(params.user);
  const res = user
    ? await getSentNotifications({ user, page, limit, type: str(params.type), read: str(params.read) })
    : null;
  return (
    <SentNotificationsView
      page={res?.status ? (res.data ?? null) : null}
      error={res && !res.status ? res.message : null}
      currentPage={page}
      pageSize={limit}
    />
  );
};

export default Page;
