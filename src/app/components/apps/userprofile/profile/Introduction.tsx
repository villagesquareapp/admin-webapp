import CardBox from "@/app/components/shared/CardBox";
import { Icon } from "@iconify/react";
import React from "react";

const Introduction = ({ user }: { user: IUser }) => {
  return (
    <>
      <CardBox>
        <h5 className="card-title font-medium text-lg mb-2">Introduction</h5>
        <p className="card-subtitle">{user?.user_details?.profile?.bio}</p>
        <div className="flex flex-col gap-3 mt-4">
          <div className="flex gap-3 items-center">
            <div className="flex gap-2 items-center">
              <Icon icon="solar:letter-outline" height="20" className="text-ld" /> Email:
            </div>
            <p className="text-ld font-semibold">
              {user?.user_details?.profile?.email || "N/A"}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="flex gap-2 items-center">
              <Icon icon="solar:user-outline" height="20" className="text-ld" /> Gender:
            </div>
            <p className="text-ld font-semibold capitalize">
              {user?.user_details?.profile?.gender || "N/A"}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="flex gap-2 items-center">
              <Icon icon="solar:calendar-outline" height="20" className="text-ld" /> Date of
              Birth:
            </div>
            <p className="text-ld font-semibold">
              {user?.user_details?.profile?.date_of_birth || "N/A"}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="flex gap-2 items-center">
              <Icon icon="solar:phone-outline" height="20" className="text-ld" /> Phone:
            </div>
            <p className="text-ld font-semibold">
              {user?.user_details?.profile?.phone || "N/A"}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="flex gap-2 items-center">
              <Icon icon="solar:money-bag-outline" height="20" className="text-ld" />{" "}
              Profession:
            </div>
            <p className="text-ld font-semibold">
              {user?.user_details?.profile?.profession || "N/A"}
            </p>
          </div>

          <div className="flex gap-3 items-center">
            <div className="flex gap-2 items-center">
              <Icon icon="solar:user-id-outline" height="20" className="text-ld" /> Account
              Type:
            </div>
            <p className="text-ld font-semibold capitalize">
              {user?.user_details?.profile?.account_type || "N/A"}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="flex gap-2 items-center">
              <Icon icon="solar:login-3-outline" height="20" className="text-ld" />{" "}
              Registration Type:
            </div>
            <p className="text-ld font-semibold capitalize">
              {user?.user_details?.profile?.registration_type || "N/A"}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="flex gap-2 items-center">
              <Icon icon="solar:clock-circle-outline" height="20" className="text-ld" />{" "}
              Timezone:
            </div>
            <p className="text-ld font-semibold capitalize">
              {user?.user_details?.profile?.address?.timezone || "N/A"}
            </p>
          </div>

          <div className="flex gap-3 items-center">
            <div className="flex gap-2 items-center">
              <Icon icon="solar:map-point-outline" height="20" className="text-ld" /> Address:
            </div>
            <p className="text-ld font-semibold">
              {user?.user_details?.profile?.address?.address || "N/A"}
            </p>
          </div>
        </div>
      </CardBox>
    </>
  );
};

export default Introduction;
