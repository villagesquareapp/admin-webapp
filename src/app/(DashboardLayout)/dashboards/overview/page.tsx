import Overview from "@/app/(DashboardLayout)/page";

const ecommerce: any = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const OverviewContent = await Overview({ searchParams });
  return OverviewContent;
};
 
export default ecommerce;
