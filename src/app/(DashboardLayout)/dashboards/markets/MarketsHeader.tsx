"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";

const NAV = [
  { href: "/dashboards/markets/products", label: "Products", icon: "solar:box-linear" },
  { href: "/dashboards/markets/shops", label: "Shops", icon: "solar:shop-2-linear" },
  { href: "/dashboards/markets/reports", label: "Reports", icon: "solar:flag-2-linear" },
  { href: "/dashboards/markets/enforcement", label: "Enforcement", icon: "solar:shield-check-linear" },
];

const MarketsHeader = () => (
  <div className="flex items-center justify-between flex-wrap gap-3">
    <div>
      <h4 className="text-lg font-bold">MarketSquare</h4>
      <p className="text-sm text-darklink">Products, shops, reports and enforcement</p>
    </div>
    <div className="flex items-center gap-2 flex-wrap">
      {NAV.map((n) => (
        <Link key={n.href} href={n.href} className="flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg border border-ld hover:border-primary hover:text-primary transition">
          <Icon icon={n.icon} height={16} /> {n.label}
        </Link>
      ))}
    </div>
  </div>
);

export default MarketsHeader;
