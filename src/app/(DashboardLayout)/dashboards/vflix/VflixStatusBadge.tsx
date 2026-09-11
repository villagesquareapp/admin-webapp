"use client";

import { VFLIX_STATUS_STYLES, formatStatusLabel } from "./vflixStatus";

const VflixStatusBadge = ({ status }: { status: string }) => {
  return (
    <span
      className={`text-sm px-3 py-1 capitalize rounded-full w-fit inline-block ${
        VFLIX_STATUS_STYLES[status] || VFLIX_STATUS_STYLES.disabled
      }`}
    >
      {formatStatusLabel(status)}
    </span>
  );
};

export default VflixStatusBadge;
