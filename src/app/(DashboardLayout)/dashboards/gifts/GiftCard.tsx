"use client";

import React, { useContext, useState } from "react";
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
import AdminAddGift from "./AdminAddGift";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Dropdown } from "flowbite-react";
import EditGiftModal from "./EditGiftModal";
import { getGifts } from "@/app/api/gift";

interface IGiftProp {
  giftsData: IGifting[] | null;
  token: string;
}

const GiftCard: React.FC<IGiftProp> = ({ giftsData, token }) => {
  // const { followers, setSearch }: any = useContext(UserDataContext);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [gifts, setGifts] = useState<IGifting[]>(giftsData || []);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingGift, setEditingGift] = useState<IGifting | null>(null);

  return (
    <>
      <div className="flex justify-between mb-6">
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
            onClick={() => setIsOpen(true)}
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
              className="lg:col-span-3 md:col-span-4 sm:col-span-6 col-span-12"
              key={gift.uuid}
            >
              <CardBox className="relative px-0 pb-0 text-center overflow-hidden">
                <div className="absolute top-4 right-4 z-10">
                  {/* <Dropdown label={<HiOutlineDotsVertical size={20} />} inline>
                    <Dropdown.Item
                      onClick={() => {
                        setEditingGift(gift);
                        setEditModalOpen(true);
                      }}
                    >
                      Edit
                    </Dropdown.Item>
                  </Dropdown> */}
                </div>
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
                  <p className="text-[16px] text-darklink font-bold">{gift.value}</p>
                </div>
                <div className="flex justify-center gap-4 items-center mt-4 pt-4 bg-muted pb-4 dark:bg-darkmuted">
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      color={gift.status === true ? "failure" : "success"}
                      size="sm"
                      className="px-4 text-sm lg:text-base"
                      // disabled={gift.status === true}
                      // onClick={() => setIsDeclineDialogOpen(true)}
                    >
                      <LiaTimesSolid size={16} />
                      {gift.status === true ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      color="success"
                      size="sm"
                      className="px-4 text-sm lg:text-base"
                      disabled={gift.status === false}
                      onClick={() => {
                        setEditingGift(gift);
                        setEditModalOpen(true);
                      }}
                      // onClick={() => setIsApproveDialogOpen(true)}
                    >
                      <IoMdCheckmark size={16} />
                      Update
                    </Button>
                  </div>
                </div>
              </CardBox>
            </div>
          );
        })}
      </div>

      {isOpen && (
        <AdminAddGift
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          token={token}
          onGiftAdded={(newGift) => setGifts((prev) => [newGift, ...prev])}
        />
      )}

      {editModalOpen && editingGift && (
        <EditGiftModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditingGift(null);
          }}
          gift={editingGift}
          // onGiftUpdated={(updatedGift) => {
          //   setGifts((prevGifts) =>
          //     prevGifts.map((gift) =>
          //       gift.uuid === updatedGift.uuid ? updatedGift : gift
          //     )
          //   );
          // }}
          onGiftUpdated={async () => {
            const fresh = await getGifts();
            if (fresh?.data) {
              setGifts(fresh.data.data);
            }
          }}
        />
      )}
    </>
  );
};

export default GiftCard;
