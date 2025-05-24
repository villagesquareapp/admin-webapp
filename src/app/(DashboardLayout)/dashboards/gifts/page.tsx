import { getGifts } from "@/app/api/gift";

const Page = async () => {
  const gifts = await getGifts();
  console.log("Gift Result:", gifts);
  return <div>Enter</div>;
};

export default Page;
