"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "flowbite-react";
import Image from "next/image";
import CardBox from "@/app/components/shared/CardBox";
import ManageCategoriesModal from "./ManageCategoriesModal";
import shape1 from "/public/images/shapes/danger-card-shape.png";
import shape2 from "/public/images/shapes/secondary-card-shape.png";
import shape3 from "/public/images/shapes/success-card-shape.png";

interface Props {
  totalLivestreams: number;
  currentlyLive: number;
  categoriesCount: number;
  initialCategories: ILivestreamCategory[];
}

const LivestreamStatsSection: React.FC<Props> = ({
  totalLivestreams,
  currentlyLive,
  categoriesCount,
  initialCategories,
}) => {
  const [isManageOpen, setIsManageOpen] = useState(false);

  const statsCards = [
    {
      total: totalLivestreams,
      icon: "mdi:video-outline",
      bgcolor: "secondary",
      title: "Total Livestreams",
      shape: shape1,
    },
    {
      total: currentlyLive,
      icon: "mdi:broadcast",
      bgcolor: "primary",
      title: "Currently Live",
      shape: shape2,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map((card, index) => (
          <CardBox
            key={index}
            className={`relative !shadow-none rounded-lg overflow-hidden bg-light${card.bgcolor} dark:bg-dark${card.bgcolor}`}
          >
            <Image
              src={card.shape}
              alt="shape"
              className="absolute end-0 top-0"
            />
            <span
              className={`w-14 h-10 rounded-full flex items-center justify-center text-white mb-8 bg-${card.bgcolor}`}
            >
              <Icon icon={card.icon} height={24} />
            </span>
            <div className="flex items-center gap-1">
              <h5 className="text-lg">{card.total}</h5>
              <span className="font-semibold border rounded-full border-black/5 dark:border-white/10 py-0.5 px-[10px] leading-[normal] text-xs">
                100%
              </span>
            </div>
            <p className="text-darklink text-sm mt-2 font-medium">
              {card.title}
            </p>
          </CardBox>
        ))}

        {/* Livestream Categories card with Manage button */}
        <CardBox className="relative !shadow-none rounded-lg overflow-hidden bg-lightsuccess dark:bg-darksuccess">
          <Image
            src={shape3}
            alt="shape"
            className="absolute end-0 top-0"
          />
          <span className="w-14 h-10 rounded-full flex items-center justify-center text-white mb-8 bg-success">
            <Icon icon="mdi:shape-outline" height={24} />
          </span>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1">
                <h5 className="text-lg">{categoriesCount}</h5>
                <span className="font-semibold border rounded-full border-black/5 dark:border-white/10 py-0.5 px-[10px] leading-[normal] text-xs">
                  100%
                </span>
              </div>
              <p className="text-darklink text-sm mt-2 font-medium">
                Livestream Categories
              </p>
            </div>
            <Button
              color="success"
              size="xs"
              onClick={() => setIsManageOpen(true)}
              className="relative z-10"
            >
              <Icon icon="solar:settings-bold-duotone" width={16} className="mr-1" />
              Manage
            </Button>
          </div>
        </CardBox>
      </div>

      {/* Manage Categories Modal */}
      <ManageCategoriesModal
        isOpen={isManageOpen}
        onClose={() => setIsManageOpen(false)}
        initialCategories={initialCategories}
      />
    </>
  );
};

export default LivestreamStatsSection;
