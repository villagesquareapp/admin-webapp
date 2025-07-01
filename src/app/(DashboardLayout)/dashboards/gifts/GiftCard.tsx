"use client";

import React, { useContext } from "react";
import {
  TbBrandFacebook,
  TbBrandGithub,
  TbBrandInstagram,
  TbBrandTwitter,
} from "react-icons/tb";
import { Badge, Button, TextInput } from "flowbite-react";
import { Icon } from "@iconify/react";
import CardBox from "@/app/components/shared/CardBox";
import Image from "next/image";
import Link from "next/link";
import { UserDataContext } from "@/app/context/UserDataContext/index";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { LiaTimesSolid } from "react-icons/lia";
import { IoMdCheckmark } from "react-icons/io";
import { FaPlus } from "react-icons/fa";

interface IGiftProp {
  giftsData: IGifting[] | null;
}

const GiftCard: React.FC<IGiftProp> = ({ giftsData }) => {
  // const { followers, setSearch }: any = useContext(UserDataContext);

  return (
    <>
      <div className="md:flex justify-between mb-6">
        <h5 className="text-2xl flex gap-3 items-center sm:my-0 my-4">
          Gifts <Badge color={"secondary"}>{giftsData?.length}</Badge>
        </h5>
        <div>
          {/* <TextInput
            icon={() => <Icon icon="solar:magnifer-line-duotone" height={18} />}
            type="text"
            sizing="md"
            className="form-control"
            placeholder="Search Friends"
              onChange={(e) => setSearch(e.target.value)}
          /> */}
          <Button
            color="success"
            size="sm"
            className="w-32 lg:w-36 lg:h-10 lg:text-base"
            // onClick={() => setIsApproveDialogOpen(true)}
          >
            <FaPlus size={16} className="mr-2" />
            Add Gift
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-30">
        {giftsData?.map((gift) => {
          return (
            <div
              className="lg:col-span-4 md:col-span-4 sm:col-span-6 col-span-12"
              key={gift.uuid}
            >
              <CardBox className="px-0 pb-0  text-center overflow-hidden">
                <Image
                  src={
                    gift.icon?.startsWith("http")
                      ? gift.icon
                      : "https://d1fmlfdhv85k5v.cloudfront.net/assets/gifts/diamond_gift.png" 
                  }
                  alt="materialm"
                  className="rounded-full mx-auto"
                  height={80}
                  width={80}
                />
                <div>
                  <h5 className="text-lg mt-3">{gift.name}</h5>
                  <p className="text-xs text-darklink">{gift.value}</p>
                </div>
                <div className="flex justify-center gap-4 items-center mt-4 pt-4 bg-muted pb-4 dark:bg-darkmuted">
                  <div className="flex justify-end gap-3 mt-4">
                    <Button
                      color="failure"
                      size="sm"
                      className="w-32 lg:w-36 lg:h-10 lg:text-base"
                      disabled={gift.status === true}
                      // onClick={() => setIsDeclineDialogOpen(true)}
                    >
                      <LiaTimesSolid size={16} className="mr-2" />
                      Disable
                    </Button>
                    <Button
                      color="success"
                      size="sm"
                      className="w-32 lg:w-36 lg:h-10 lg:text-base"
                      disabled={gift.status === false}
                      // onClick={() => setIsApproveDialogOpen(true)}
                    >
                      <IoMdCheckmark size={16} className="mr-2" />
                      Enable
                    </Button>
                  </div>
                </div>
              </CardBox>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default GiftCard;
