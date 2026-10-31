// Shared by the server pages (to read ?section=) and the client views.
export const SECTIONS: { key: AnalyticsSection; label: string; short: string; icon: string; tone: string }[] = [
  { key: "app", label: "Whole app", short: "App", icon: "solar:smartphone-2-bold-duotone", tone: "bg-lightprimary text-primary" },
  { key: "social", label: "Social", short: "Social", icon: "solar:document-text-bold-duotone", tone: "bg-lightprimary text-primary" },
  { key: "vflix", label: "VFlix", short: "VFlix", icon: "solar:video-frame-play-vertical-bold-duotone", tone: "bg-lightsecondary text-secondary" },
  { key: "live", label: "Live", short: "Live", icon: "solar:play-stream-bold-duotone", tone: "bg-lighterror text-error" },
  { key: "echo", label: "Echo", short: "Echo", icon: "solar:microphone-bold-duotone", tone: "bg-lightinfo text-info" },
  { key: "atc", label: "ATC – African Talent Challenge", short: "ATC", icon: "game-icons:africa", tone: "bg-lightwarning text-warning" },
  { key: "trybes", label: "Trybes", short: "Trybes", icon: "solar:users-group-two-rounded-bold-duotone", tone: "bg-lightsuccess text-success" },
  { key: "marketsquare", label: "MarketSquare", short: "MarketSquare", icon: "solar:shop-2-bold-duotone", tone: "bg-lightwarning text-warning" },
  { key: "messages", label: "Messages", short: "Messages", icon: "solar:chat-round-dots-bold-duotone", tone: "bg-lightprimary text-primary" },
  { key: "wallet", label: "Wallet", short: "Wallet", icon: "solar:wallet-money-bold-duotone", tone: "bg-lightsuccess text-success" },
  { key: "meetings", label: "Meetings", short: "Meetings", icon: "solar:videocamera-record-bold-duotone", tone: "bg-lightsecondary text-secondary" },
  { key: "profile", label: "Profile", short: "Profile", icon: "solar:user-circle-bold-duotone", tone: "bg-lightinfo text-info" },
];

const FALLBACK_SECTION = { label: "", short: "", icon: "solar:widget-bold-duotone", tone: "bg-lightgray dark:bg-white/5 text-darklink" };

export const sectionMeta = (key: string) => {
  const s = SECTIONS.find((x) => x.key === key);
  const name = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
  return s ?? { ...FALLBACK_SECTION, key, label: name, short: name };
};

export const SECTION_KEYS = SECTIONS.map((s) => s.key);
