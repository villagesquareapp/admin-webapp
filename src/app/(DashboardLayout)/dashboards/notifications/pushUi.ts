import { format, formatDistanceToNowStrict, parseISO } from "date-fns";

export const BROADCAST_UUID = "00000000-0000-0000-0000-000000000000";

export const AUDIENCES: { value: PushAudience; label: string; icon: string; hint: string }[] = [
  { value: "all", label: "Everyone", icon: "solar:users-group-rounded-bold-duotone", hint: "Every device with the app" },
  { value: "ios", label: "iOS", icon: "mdi:apple", hint: "iPhones and iPads only" },
  { value: "android", label: "Android", icon: "mdi:android", hint: "Android phones only" },
  { value: "users", label: "Chosen users", icon: "solar:user-check-rounded-bold-duotone", hint: "People you pick" },
];

export const audienceOf = (n: IPushNotifications): PushAudience =>
  n.audience ?? ((n.target ?? []).includes(BROADCAST_UUID) ? "all" : "users");

export const audienceLabel = (n: IPushNotifications) => {
  const a = audienceOf(n);
  if (a !== "users") return AUDIENCES.find((x) => x.value === a)!.label;
  const count = n.recipients_count ?? n.target?.length ?? 0;
  return `${count} ${count === 1 ? "user" : "users"}`;
};

export const STATUS_TONE: Record<string, string> = {
  scheduled: "bg-lightsecondary text-secondary",
  sending: "bg-lightprimary text-primary",
  sent: "bg-lightsuccess text-success",
  partial: "bg-lightwarning text-warning",
  failed: "bg-lighterror text-error",
  cancelled: "bg-lightgray dark:bg-dark text-darklink",
};

export const STATUS_LABEL: Record<string, string> = {
  scheduled: "Scheduled",
  sending: "Sending",
  sent: "Sent",
  partial: "Partly sent",
  failed: "Failed",
  cancelled: "Cancelled",
};

export const whenOf = (n: IPushNotifications) =>
  n.status === "scheduled" || n.status === "cancelled"
    ? n.scheduled_at ?? n.created_at
    : n.sent_at ?? n.created_at;

export const formatDateTime = (iso?: string | null) => {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "MMM d, yyyy · h:mm a");
  } catch {
    return iso;
  }
};

export const relative = (iso?: string | null) => {
  if (!iso) return "";
  try {
    return formatDistanceToNowStrict(parseISO(iso), { addSuffix: true });
  } catch {
    return "";
  }
};

export const compact = (n?: number | null) =>
  new Intl.NumberFormat("en", { notation: "compact" }).format(n || 0);
