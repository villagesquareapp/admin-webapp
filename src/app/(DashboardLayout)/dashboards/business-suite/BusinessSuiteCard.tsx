import React from "react";
import StatsCard from "./StatsCard";

const BusinessSuiteCard = ({ token }: { token: string }) => {
  return (
    <div>
      <h5 className="text-2xl flex gap-3 items-center my-4">
        Business Suite
      </h5>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <StatsCard
          label="Settings"
          href="/dashboards/settings"
          icon="solar:settings-line-duotone"
        />
        <StatsCard
          label="Push Notifications"
          href="/dashboards/notifications"
          icon="bxs:notification"
        />
      </div>
    </div>
  );
};

export default BusinessSuiteCard;
