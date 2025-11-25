"use client";

import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { ReactNode } from "react";

interface StatsCardProps {
  label: string;
  href: string;
  icon: string;
  background?: string; 
}

export default function StatsCard({ label, href, icon, background }: StatsCardProps) {
  return (
    <Link
      href={href}
      className={`rounded-2xl p-6 flex flex-col justify-center shadow-md transition-all hover:scale-[1.02] ${
        background || "bg-[#1b2233]"
      }`}
    >
      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10">
        <Icon icon={icon} width={28} height={28} className="text-white" />
      </div>
      <div className="text-gray-300 text-lg font-medium whitespace-nowrap">
        {label}
      </div>
    </Link>
  );
}
