import { getToken } from "@/lib/getToken";
import PushNotification from "./PushNotification";
import { getEchoes } from "@/app/api/echo";

const Page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const token = await getToken();
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;

  const [echoes] = await Promise.all([getEchoes(page, limit)]);

  if (!token) throw new Error("No token found");

  return (
    <>
      <div>
        <PushNotification
          echoes={echoes?.data || null}
          totalPages={echoes?.data?.last_page || 1}
          currentPage={page}
          pageSize={limit}
        />
      </div>
    </>
  );
};

export default Page;
