"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import CardBox from "@/app/components/shared/CardBox";

type ColorKey = "primary" | "secondary" | "success" | "warning" | "error";

// Literal class strings so Tailwind keeps them (no dynamic interpolation).
const COLORS: Record<ColorKey, string> = {
  primary: "bg-lightprimary text-primary",
  secondary: "bg-lightsecondary text-secondary",
  success: "bg-lightsuccess text-success",
  warning: "bg-lightwarning text-warning",
  error: "bg-lighterror text-error",
};

interface StatsCardProps {
  label: string;
  href: string;
  icon: string;
  description?: string;
  color?: ColorKey;
}

export default function StatsCard({
  label,
  href,
  icon,
  description,
  color = "primary",
}: StatsCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <CardBox className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:hover:shadow-dark-md">
        <div className="flex flex-col gap-4 p-2">
          <div className="flex items-center justify-between">
            <span
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${COLORS[color]}`}
            >
              <Icon icon={icon} height={26} />
            </span>
            <Icon
              icon="solar:alt-arrow-right-line-duotone"
              height={22}
              className="text-darklink transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary"
            />
          </div>
          <div>
            <h5 className="text-lg font-semibold">{label}</h5>
            {description && (
              <p className="text-sm text-darklink mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
      </CardBox>
    </Link>
  );
}
