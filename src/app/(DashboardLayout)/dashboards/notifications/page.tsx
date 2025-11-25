import { getToken } from "@/lib/getToken";
import PushNotification from "./PushNotification";

const Page = async () => {
  const token = await getToken();

  if (!token) throw new Error("No token found");

  return (
    <>
        <div>
            <PushNotification />
        </div>
    </>
  );
};

export default Page;
