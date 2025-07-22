"use client";

import React, { useContext, useState } from "react";
import {
  TbBrandFacebook,
  TbBrandGithub,
  TbBrandInstagram,
  TbBrandTwitter,
} from "react-icons/tb";
import { Badge, Button, Spinner, TextInput } from "flowbite-react";
import { Icon } from "@iconify/react";
import CardBox from "@/app/components/shared/CardBox";
import Image from "next/image";
import Link from "next/link";
import { UserDataContext } from "@/app/context/UserDataContext/index";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { LiaTimesSolid } from "react-icons/lia";
import { IoMdCheckmark } from "react-icons/io";
import { FaPlus } from "react-icons/fa";

import { HiOutlineDotsVertical } from "react-icons/hi";
import { Dropdown } from "flowbite-react";
import { getCoins } from "@/app/api/coin";
import EditCoin from "./EditCoin";
import AddCoin from "./AddCoin";
import ChangeCoinStatus from "./ChangeCoinStatus";

interface ICoinProp {
  coinsData: ICoins[] | null;
  token: string;
}

const CoinCard: React.FC<ICoinProp> = ({ coinsData, token }) => {
  // const { followers, setSearch }: any = useContext(UserDataContext);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  // const [gifts, setGifts] = useState<IGiftingResponse>();

  const [coins, setCoins] = useState<ICoins[]>(coinsData ?? []);

  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editingCoin, setEditingCoin] = useState<ICoins | null>(null);

  const [changeStatusModalOpen, setChangeStatusModalOpen] =
    useState<boolean>(false);

  const [loadingCoins, setLoadingCoins] = useState<boolean>(false);

  const fetchCoins = async () => {
    setLoadingCoins(true);
    const res = await getCoins();
    if (Array.isArray(res?.data)) {
      setCoins(res?.data);
    }
    setLoadingCoins(false);
  };

  return (
    <>
      <div className="flex justify-between mb-6">
        <h5 className="text-2xl flex gap-3 items-center sm:my-0 my-4">
          Coins <Badge color={"secondary"}>{coins?.length}</Badge>
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
            Add Coin
          </Button>
        </div>
      </div>
      {loadingCoins ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" color="success" />
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {coins?.map((coin) => {
            return (
              <div
                className="lg:col-span-3 md:col-span-4 sm:col-span-6 col-span-12"
                key={coin.uuid}
              >
                <CardBox className="min-h-[250px] relative px-0 pb-0 text-center overflow-hidden">
                  <div className="absolute top-2 right-3 text-white text-lg font-bold px-2 py-1 rounded">
                    {/* ₦{coin.price} */}
                    ${coin.price}
                  </div>
                  <Image
                    src={
                      "https://cdn-assets.villagesquare.io/assets/coins/villagesquare-coin.png"
                    }
                    alt="coin"
                    className="w-20 h-20 object-cover rounded-full mx-auto"
                    width={80}
                    height={80}
                  />
                  <div>
                    <h5 className="text-lg mt-3">{coin.name === null ? `${coin.amount} coins` : coin.name}</h5>
                    <p className="text-[16px] text-darklink font-bold">
                      {coin.amount}
                    </p>
                  </div>
                  <div className="flex justify-center gap-4 items-center mt-4 pt-4 bg-muted pb-4 dark:bg-darkmuted">
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        color={coin.status === true ? "failure" : "success"}
                        size="sm"
                        className="px-4 text-sm lg:text-base"
                        onClick={() => {
                            setEditingCoin(coin);
                          setChangeStatusModalOpen(true);
                        }}
                      >
                        {coin.status === true ? (
                          <LiaTimesSolid size={16} />
                        ) : (
                          <IoMdCheckmark size={16} />
                        )}
                        {coin.status === true ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        color="success"
                        size="sm"
                        className="px-4 text-sm lg:text-base"
                        disabled={coin.status === false}
                        onClick={() => {
                          setEditingCoin(coin);
                          setEditModalOpen(true);
                        }}
                      >
                        <IoMdCheckmark size={16} />
                        Update Coin
                      </Button>
                    </div>
                  </div>
                </CardBox>
              </div>
            );
          })}
        </div>
      )}

      {editModalOpen && editingCoin && (
        <EditCoin
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditingCoin(null);
          }}
          coin={editingCoin}
          onCoinUpdated={fetchCoins}
        />
      )}

      {isOpen && (
        <AddCoin
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          token={token}
          onCoinAdded={fetchCoins}
        />
      )}
      {changeStatusModalOpen && (
        <ChangeCoinStatus
          isOpen={changeStatusModalOpen}
          onClose={() => {
            setChangeStatusModalOpen(false);
          }}
          coin={editingCoin}
          refreshCoins={fetchCoins}
        />
      )}
    </>
  );
};

export default CoinCard;
