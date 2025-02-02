import Image from "next/image";
import PremiumIcon from "/public/images/svgs/vs-svgs/premium.svg";
import CheckBadgeIcon from "/public/images/svgs/vs-svgs/check-badge.svg";

export const DetailComp = ({ detail }: { detail: string }) => {
  return (
    <div className="relative group">
      <p className="text-darklink dark:text-bodytext text-sm truncate max-w-[200px]">
        {detail || "-"}
      </p>
      <span className="invisible group-hover:visible absolute left-0 -top-8 dark:bg-gray-900 bg-gray-700 text-white px-2 py-1 rounded text-sm whitespace-nowrap z-50 pointer-events-none">
        {detail || "-"}
      </span>
    </div>
  );
};

export const UserDetailsComp = ({
  user,
  showActive = false,
  showPremiumAndCheckMark = false,
}: {
  user: IUserTableDetails;
  showActive?: boolean;
  showPremiumAndCheckMark?: boolean;
}) => {
  return (
    <div className="flex gap-3 items-center">
      <div className="relative size-12 rounded-full">
        {!user?.last_online && showActive && (
          <div className="size-3 rounded-full bg-green-500 absolute bottom-0 right-1 z-10"></div>
        )}
        <Image
          src={user?.profile_picture}
          alt="icon"
          fill
          className="rounded-full object-cover"
        />
      </div>

      <div className="sm:max-w-56 flex flex-col">
        <div className="flex items-center gap-1">
          <div>
            <h6 className="text-base relative group">
              <span className="block truncate max-w-[200px]">{user?.name}</span>
              <span className="invisible group-hover:visible absolute left-0 -top-8 dark:bg-gray-900 bg-gray-700  text-white px-2 py-1 rounded text-sm whitespace-nowrap z-50 pointer-events-none">
                {user?.name}
              </span>
            </h6>
          </div>
          {user?.check_mark && showPremiumAndCheckMark && (
            <Image src={CheckBadgeIcon} alt="premium" width={28} height={28} />
          )}
          {user?.premium && showPremiumAndCheckMark && (
            <Image src={PremiumIcon} alt="premium" width={18} height={18} />
          )}
        </div>
        <p className="text-sm !truncate text-darklink dark:text-bodytext">@{user?.username}</p>
      </div>
    </div>
  );
};
