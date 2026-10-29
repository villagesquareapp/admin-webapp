// Shared presentation for moderation actions (labels, tone classes, icons).
// Keep in sync with the Admin API ModerationAction enum.

const LABELS: Record<string, string> = {
  remove_content: "Took down content",
  restore_content: "Restored content",
  limit_visibility: "Limited reach",
  unfeature_content: "Removed from featured",
  warn_user: "Warned author",
  strike_user: "Added a strike",
  restrict_user: "Restricted author",
  suspend_user: "Suspended author",
  shadowban_user: "Shadow-banned author",
  ban_user: "Banned author",
  reinstate_user: "Reinstated author",
  force_logout: "Forced logout",
  change_status: "Changed status",
  feature_content: "Featured content",
  trend_override: "Changed trending",
  force_end: "Ended live session",
  approve_template: "Approved template",
  reject_template: "Rejected template",
  remove_template: "Removed template",
  approve_verification: "Approved verification",
  reject_verification: "Rejected verification",
  send_push: "Sent a push",
  resend_push: "Resent a push",
  broadcast_push: "Pushed to a whole audience",
  schedule_push: "Scheduled a push",
  cancel_push: "Cancelled a scheduled push",
  delete_push: "Deleted a push",
  add_faq: "Added an FAQ question",
  change_faq: "Edited an FAQ question",
  delete_faq: "Deleted an FAQ question",
  add_faq_category: "Added an FAQ section",
  change_faq_category: "Renamed an FAQ section",
  delete_faq_category: "Deleted an FAQ section",
  hide_hashtag: "Hid a hashtag",
  restore_hashtag: "Restored a hashtag",
  remove_mention: "Removed a mention",
  hide_trending: "Took off trending",
  unhide_trending: "Put back on trending",
  remove_notification: "Removed a notification",
  change_ledger_account_status: "Changed a ledger account",
  add_setting: "Added a setting",
  change_setting: "Changed a setting",
  delete_setting: "Deleted a setting",
  create_staff_account: "Added a staff member",
  change_staff_account: "Changed a staff member",
};

// error = destructive, warning = limiting, success = restorative, info = other
const TONE_KIND: Record<string, "error" | "warning" | "success" | "info"> = {
  remove_content: "error",
  ban_user: "error",
  suspend_user: "error",
  force_logout: "error",
  limit_visibility: "warning",
  unfeature_content: "warning",
  warn_user: "warning",
  strike_user: "warning",
  restrict_user: "warning",
  shadowban_user: "warning",
  restore_content: "success",
  reinstate_user: "success",
  approve_template: "success",
  approve_verification: "success",
  force_end: "error",
  remove_template: "error",
  reject_template: "warning",
  reject_verification: "warning",
  delete_push: "warning",
  cancel_push: "warning",
  delete_setting: "warning",
  delete_faq: "warning",
  delete_faq_category: "warning",
  hide_hashtag: "warning",
  restore_hashtag: "success",
  remove_mention: "warning",
  hide_trending: "warning",
  unhide_trending: "success",
  remove_notification: "warning",
};

const TONE_CLASS: Record<string, string> = {
  error: "bg-lighterror text-error",
  warning: "bg-lightwarning text-warning",
  success: "bg-lightsuccess text-success",
  info: "bg-lightinfo text-info",
};

const ICONS: Record<string, string> = {
  remove_content: "solar:trash-bin-trash-linear",
  restore_content: "solar:refresh-linear",
  limit_visibility: "solar:eye-closed-linear",
  unfeature_content: "solar:star-fall-linear",
  warn_user: "solar:danger-triangle-linear",
  strike_user: "solar:bolt-linear",
  restrict_user: "solar:shield-minus-linear",
  suspend_user: "solar:user-block-linear",
  shadowban_user: "solar:ghost-linear",
  ban_user: "solar:forbidden-circle-linear",
  reinstate_user: "solar:user-check-linear",
  force_logout: "solar:logout-3-linear",
};

const titleize = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const actionLabel = (action: string) => LABELS[action] || titleize(action);
export const actionKind = (action: string) => TONE_KIND[action] || "info";
export const actionTone = (action: string) => TONE_CLASS[actionKind(action)];
export const actionIcon = (action: string) => ICONS[action] || "solar:shield-check-linear";

export const REPORT_STATUS_TONE: Record<string, string> = {
  open: "bg-lighterror text-error",
  in_review: "bg-lightwarning text-warning",
  resolved: "bg-lightsuccess text-success",
  dismissed: "bg-lightgray text-darklink dark:bg-dark",
};

export const POST_STATUS_TONE: Record<string, string> = {
  active: "bg-lightsuccess text-success",
  reported: "bg-lightwarning text-warning",
  flagged: "bg-lightwarning text-warning",
  shadow_hidden: "bg-lightwarning text-warning",
  disabled: "bg-lightgray text-darklink dark:bg-dark",
  archived: "bg-lightinfo text-info",
  suspended: "bg-lighterror text-error",
  banned: "bg-lighterror text-error",
};
