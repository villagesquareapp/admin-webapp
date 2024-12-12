import Overview from "@/app/(DashboardLayout)/page";

const ecommerce = async () => {
  const OverviewContent = await Overview();
  return OverviewContent;
};

export default ecommerce;
