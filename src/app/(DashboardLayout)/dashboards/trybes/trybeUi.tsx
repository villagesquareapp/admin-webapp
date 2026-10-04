"use client";

import { Icon } from "@iconify/react";

const CHIP: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  suspended: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  banned: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300",
  archived: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  withdrawn: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  left: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  removed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  owner: "bg-lightsecondary text-secondary",
  admin: "bg-lightprimary text-primary",
  moderator: "bg-lightinfo text-info",
  member: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

export const label = (value: string) => {
  const spaced = (value || "").replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

export const Chip = ({ value }: { value: string }) => (
  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${CHIP[value] || CHIP.withdrawn}`}>
    {label(value)}
  </span>
);

export const KV = ({ name, value }: { name: string; value?: React.ReactNode }) => (
  <div className="flex justify-between gap-3 py-1.5 text-sm border-b border-dashed border-border dark:border-darkborder last:border-0">
    <span className="text-darklink">{name}</span>
    <span className="font-medium text-right max-w-[260px] break-words">{value ?? "—"}</span>
  </div>
);

export const Person = ({
  user,
  sub,
}: {
  user: { name?: string | null; username?: string | null; profile_picture?: string | null; uuid?: string };
  sub?: string;
}) => (
  <div className="flex items-center gap-3 min-w-0">
    {user?.profile_picture ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={user.profile_picture} alt="" className="size-9 rounded-full object-cover shrink-0" />
    ) : (
      <span className="size-9 rounded-full grid place-items-center bg-lightprimary text-primary shrink-0 text-sm font-semibold">
        {(user?.name || user?.username || "?").charAt(0).toUpperCase()}
      </span>
    )}
    <div className="min-w-0">
      <p className="text-sm font-medium truncate max-w-[200px]">{user?.name || "Unknown"}</p>
      <p className="text-xs text-darklink truncate max-w-[200px]">
        {sub ?? (user?.username ? `@${user.username}` : user?.uuid)}
      </p>
    </div>
  </div>
);

export const TrybeAvatar = ({ src, name, size = 40 }: { src?: string | null; name: string; size?: number }) =>
  src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" style={{ width: size, height: size }} className="rounded-full object-cover shrink-0" />
  ) : (
    <span
      style={{ width: size, height: size }}
      className="rounded-full grid place-items-center bg-lightsecondary text-secondary shrink-0"
    >
      <Icon icon="solar:users-group-two-rounded-bold" height={size / 2} />
    </span>
  );

export const REJECT_REASONS = [
  "Your ID photo is blurry or cut off. Please retake it.",
  "Your selfie doesn't match the photo on your ID.",
  "This isn't a valid student ID for this school.",
  "Your details don't match your student ID.",
];
