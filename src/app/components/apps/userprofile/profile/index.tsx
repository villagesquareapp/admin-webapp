"use client";
import Introduction from "@/app/components/apps/userprofile/profile/Introduction";
import Photos from "@/app/components/apps/userprofile/profile/Photos";
import Post from "@/app/components/apps/userprofile/profile/Post";
import ProfileBanner from "@/app/components/apps/userprofile/profile/ProfileBanner";
import React from "react";
import { UserDataProvider } from "@/app/context/UserDataContext/index";
import { redirect } from "next/navigation";

interface UserProfileAppProps {
  user: IUser | null;
}

const UserProfileApp = ({ user }: UserProfileAppProps) => {
  if (!user) return <p>User doesn&apos;t exist</p>;

  return (
    <>
      <UserDataProvider>
        <div className="grid grid-cols-12 gap-30">
          {/* Banner */}
          <div className="col-span-12">
            <ProfileBanner user={user} />
          </div>
          <div className="lg:col-span-4 col-span-12">
            <div className="grid grid-cols-12">
              {/* Introduction */}
              <div className="col-span-12 mb-30">
                <Introduction user={user} />
              </div>
              {/* Photos */}
              {/* <div className="col-span-12">
                <Photos />
              </div> */}
            </div>
          </div>
          <div className="lg:col-span-8 col-span-12">
            <Post />
          </div>
        </div>
      </UserDataProvider>
    </>
  );
};

export default UserProfileApp;
