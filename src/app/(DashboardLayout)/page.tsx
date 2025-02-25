import { getEchoStats } from "../api/echo";
import { getLivestreamStats } from "../api/livestream";
import { getMarketSquareStats } from "../api/market-square";
import { getPendingVerification, getVerificationRequested } from "../api/pending-verification";
import { getPostStats } from "../api/post";
import { getUserDetails, getUsers, getUserStats } from "../api/user";
import { getPendingWithdrawals } from "../api/wallet";
import SmallCards from "../components/dashboards/ecommerce/smallCards";
import PendingVerifications from "./PendingVerifications";
import Withdrawals from "./Withdrawals";
import shape5 from "/public/images/shapes/circle-white-shape.png";
import shape4 from "/public/images/shapes/circlr-shape.png";
import shape1 from "/public/images/shapes/danger-card-shape.png";
import shape2 from "/public/images/shapes/secondary-card-shape.png";
import shape3 from "/public/images/shapes/success-card-shape.png";

const Page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const selectedWithdrawalID = searchParams.withdrawal as string;
  const selectedPendingVerificationID = searchParams.pending_verification as string;
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;
  const pWLimit = Number(searchParams.pwLimit) || 10;
  const pWPage = Number(searchParams.pwPage) || 1;

  const [
    userStats,
    postStats,
    marketSquareStats,
    liveStreamStats,
    echoStats,
    pendingVerification,
    pendingWithdrawals,
  ] = await Promise.all([
    getUserStats(),
    getPostStats(),
    getMarketSquareStats(),
    getLivestreamStats(),
    getEchoStats(),
    getPendingVerification(page, limit),
    getPendingWithdrawals(pWPage, pWLimit),
  ]);


  let selectedPendingVerification: IPendingVerification | null = null;
  let selectedVerificationRequested: IVerificationRequested | null = null;
  let selectedUser: IUser | null = null;

  if (selectedPendingVerificationID) {
    selectedPendingVerification = pendingVerification?.data?.data.find(
      (item) => item?.verification_request?.id === selectedPendingVerificationID
    ) || null;

    if (selectedPendingVerification) {
      const [user, verificationRequested] = await Promise.all([
        getUserDetails(selectedPendingVerification?.user?.uuid || ""),
        getVerificationRequested(selectedPendingVerification?.verification_request?.id || "")
      ])

      selectedVerificationRequested = !!verificationRequested?.data ? verificationRequested?.data : null;

      selectedUser = !!user?.data ? user?.data : null;

    }


  }

  const overviewData: IOverviewData[] = [
    {
      total: userStats?.data?.total_users || 0,
      icon: "mdi:account-group",
      bgcolor: "secondary",
      title: "Total Users",
      shape: shape1,
      link: "/dashboards/users",
    },
    {
      total: postStats?.data?.total_posts || 0,
      icon: "mdi:post",
      bgcolor: "success",
      title: "Total Posts",
      shape: shape2,
      link: "/dashboards/posts",
    },
    {
      total: marketSquareStats?.data?.total_products || 0,
      icon: "mdi:store",
      bgcolor: "primary",
      title: "Total Market Squares",
      shape: shape3,
      link: "/dashboards/markets",
    },
    {
      total: liveStreamStats?.data?.total_livestreams || 0,
      icon: "mdi:video",
      bgcolor: "info",
      title: "Total Live Streams",
      shape: shape4,
      link: "/dashboards/livestreams",
    },
    {
      total: echoStats?.data?.total_echoes || 0,
      icon: "mdi:video-wireless",
      bgcolor: "warning",
      title: "Total Echoes",
      shape: shape5,
      link: "/dashboards/echoes",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-12 gap-y-8 lg:gap-x-30 lg:gap-y-30">
        {/* <div className="lg:col-span-6  col-span-12">
          <Welcome />
        </div> */}
        {/* <div className="lg:col-span-6 col-span-12"> */}
        <div className="col-span-12">
          <SmallCards overviewData={overviewData} />
        </div>
        {/* @Remove from here */}
        {/* <div className="lg:col-span-8 col-span-12">
          <SalesProfit />
        </div>
        <div className="lg:col-span-4 col-span-12">
          <ProductSales />
        </div>
        <div className="lg:col-span-5 col-span-12">
          <MarketingReport />
        </div>
        <div className="lg:col-span-3 col-span-12">
          <Payments />
        </div>
        <div className="lg:col-span-4 col-span-12">
          <AnnualProfit />
        </div> */}
        {/* @Remove to here */}
        <div className="lg:col-span-7 col-span-12">
          <PendingVerifications
            pendingVerification={pendingVerification?.data || null}
            totalPages={pendingVerification?.data?.last_page || 1}
            currentPage={page}
            pageSize={limit}
            currentSelectedPendingVerification={selectedPendingVerification}
            currentSelectedVerificationRequested={selectedVerificationRequested}
            currentSelectedUser={selectedUser}
          />
        </div>
        <div className="lg:col-span-5 col-span-12">
          <Withdrawals
            selectedWithdrawalID={selectedWithdrawalID}
            withdrawals={pendingWithdrawals?.data || null}
            totalPages={pendingWithdrawals?.data?.last_page || 1}
            currentPage={pWPage}
            pageSize={pWLimit}
          />
        </div>
      </div>
    </>
  );
};

export default Page;
