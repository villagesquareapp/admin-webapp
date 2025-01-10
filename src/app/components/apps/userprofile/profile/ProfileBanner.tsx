import CardBox from "@/app/components/shared/CardBox";
import Image from "next/image";
import { TbFileDescription, TbUserCheck, TbUserCircle } from "react-icons/tb";
import Banner from "/public/images/backgrounds/profilebg.jpg";
import CheckBadgeIcon from "/public/images/svgs/vs-svgs/check-badge.svg";
import PremiumIcon from "/public/images/svgs/vs-svgs/premium.svg";

const ProfileBanner = ({ user }: { user: IUser | null }) => {
  return (
    <>
      <CardBox className="p-0 overflow-hidden">
        <div className="relative h-[330px] w-full">
          <Image
            src={user?.user_details?.profile?.profile_banner || Banner}
            alt="priofile banner"
            className="w-full object-cover"
            fill
          />
        </div>
        <div className="bg-white dark:bg-dark p-6 -mt-2">
          <div className="grid grid-cols-12 gap-3">
            <div className="lg:col-span-4 col-span-12 lg:order-1 order-2">
              <div className="flex gap-6 items-center justify-around lg:py-0 py-4">
                <div className="text-center">
                  <TbFileDescription className="block mx-auto text-ld opacity-50 " size="20" />
                  <h4 className="text-xl">{user?.user_details?.profile?.posts_count}</h4>
                  <p className="text-darklink text-sm">Posts</p>
                </div>
                <div className="text-center">
                  <TbUserCircle className="block mx-auto text-ld opacity-50" size="20" />
                  <h4 className="text-xl">{user?.user_details?.profile?.followers}</h4>
                  <p className="text-darklink text-sm">Followers</p>
                </div>
                <div className="text-center">
                  <TbUserCheck className="block mx-auto text-ld opacity-50" size="20" />
                  <h4 className="text-xl">{user?.user_details?.profile?.following}</h4>
                  <p className="text-darklink text-sm">Following</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 col-span-12 lg:order-2 order-1">
              <div className="text-center -mt-20">
                <div className="relative h-[100px] w-[100px] mx-auto">
                  <Image
                    src={
                      user?.user_details?.profile?.profile_picture ||
                      "/images/profile/user-1.jpg"
                    }
                    alt="profile"
                    fill
                    className="rounded-full object-cover z-10 border-4 border-white dark:border-darkborder"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <h5 className="text-base ">{user?.user_details?.profile?.name}</h5>
                    {user?.user_details?.profile?.check_mark && (
                      <Image src={CheckBadgeIcon} alt="premium" width={28} height={28} />
                    )}
                    {user?.user_details?.profile?.premium && (
                      <Image src={PremiumIcon} alt="premium" width={18} height={18} />
                    )}
                  </div>
                </div>
                <p className="text-darklink">
                  {user?.user_details?.profile?.username || "N/A"}
                </p>
              </div>
            </div>
            {/* <div className="lg:col-span-4 col-span-12 lg:order-3 order-3">
              <div className="flex items-center gap-3.5 lg:justify-end justify-center h-full xl:pe-4">
                <Button
                  as={Link}
                  href={""}
                  className="h-9 w-9 rounded-full p-0"
                  color={"primary"}
                >
                  <TbBrandFacebook size={20} />
                </Button>
                <Button
                  as={Link}
                  href={""}
                  className="h-9 w-9 rounded-full p-0"
                  color={"secondary"}
                >
                  <TbBrandDribbble size={20} />
                </Button>
                <Button
                  as={Link}
                  href={""}
                  className="h-9 w-9 rounded-full p-0"
                  color={"error"}
                >
                  <TbBrandYoutube size={20} />
                </Button>
                <Button color={"primary"}>Add To Story</Button>
              </div>
            </div> */}
          </div>
        </div>
        {/* Profile Tabs */}
        {/* <ProfileTab /> */}
      </CardBox>
    </>
  );
};

export default ProfileBanner;
