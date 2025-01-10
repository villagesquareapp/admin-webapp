"use client";

import UserProfileApp from "@/app/components/apps/userprofile/profile";
import BreadcrumbComp from "../../layout/shared/breadcrumb/BreadcrumbComp";

export default function UserProfileWrapper({
  user,
  breadcrumbs,
}: {
  user: IUser | null;
  breadcrumbs: Array<{ to?: string; title: string }>;
}) {
  return (
    <>
      <BreadcrumbComp title="User Profile" items={breadcrumbs} />
      <UserProfileApp user={user} />
    </>
  );
}
