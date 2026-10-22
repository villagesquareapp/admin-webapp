import { getSecurity } from "@/app/api/security";
import SecurityComp from "./SecurityComp";

// Every staff member's own sign-in methods; no permission needed.
const Page = async () => {
  const res = await getSecurity();
  return <SecurityComp initial={res?.status ? (res.data ?? null) : null} />;
};

export default Page;
