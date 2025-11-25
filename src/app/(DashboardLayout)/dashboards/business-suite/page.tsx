import { getGifts } from "@/app/api/gift";
import { getToken } from "@/lib/getToken";
import BusinessSuiteCard from "./BusinessSuiteCard";

const Page = async () => {
  const token = await getToken();

  if (!token) throw new Error("No token found");
  // console.log("Gift Result:", gifts)

  return (
    <>
      <BusinessSuiteCard token={token} />
    </>
  );
};

export default Page;
