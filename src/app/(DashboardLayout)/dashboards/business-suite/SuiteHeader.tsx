"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";

// Page header for the Business Suite pages, in the same style as the other
// redesigned pages: title and subtitle, a back arrow on sub-pages, actions on
// the right.
const SuiteHeader = ({
  title,
  subtitle,
  back,
  actions,
}: {
  title: string;
  subtitle?: React.ReactNode;
  back?: string;
  actions?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between flex-wrap gap-3">
    <div className="flex items-center gap-2 min-w-0">
      {back && (
        <Link href={back} aria-label="Back" className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-darklink">
          <Icon icon="solar:alt-arrow-left-linear" height={20} />
        </Link>
      )}
      <div className="min-w-0">
        <h4 className="text-lg font-bold">{title}</h4>
        {subtitle && <p className="text-sm text-darklink">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
  </div>
);

export default SuiteHeader;
