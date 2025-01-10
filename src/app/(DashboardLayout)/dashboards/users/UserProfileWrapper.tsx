"use client";

import UserProfileApp from "@/app/components/apps/userprofile/profile";
import MyBreadcrumbComp from "../../layout/shared/breadcrumb/MyBreadcrumbComp";

export default function UserProfileWrapper({
  user,
  breadcrumbs,
}: {
  user: IUser | null;
  breadcrumbs: Array<{ to?: string; title: string }>;
}) {
  return (
    <>
      <MyBreadcrumbComp title="User Profile" items={breadcrumbs} />
      <UserProfileApp user={user} />
    </>
  );
}
