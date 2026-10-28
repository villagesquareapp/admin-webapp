import React from "react";
import StatsCard from "./StatsCard";

const items = [
  {
    label: "Settings",
    href: "/dashboards/settings",
    icon: "solar:settings-bold-duotone",
    description: "Platform configuration keys and feature flags.",
    color: "primary" as const,
  },
  {
    label: "Push Notifications",
    href: "/dashboards/notifications",
    icon: "solar:bell-bing-bold-duotone",
    description: "Send now or schedule pushes to everyone, a platform or chosen users, and see what was delivered.",
    color: "secondary" as const,
  },
  {
    label: "ATC Management",
    href: "/dashboards/atc-management",
    icon: "solar:cup-star-bold-duotone",
    description: "The monthly Africa Talent Challenge cycle, its timeline and How it works content.",
    color: "success" as const,
  },
];

const BusinessSuiteCard = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <StatsCard key={item.href} {...item} />
      ))}
    </div>
  );
};

export default BusinessSuiteCard;
