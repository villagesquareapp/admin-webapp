"use client";
import { Button, Dropdown } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { IoMdCheckmark } from "react-icons/io";
import { LiaTimesSolid } from "react-icons/lia";
import CardBox from "../components/shared/CardBox";

import Image from "next/image";

const Withdrawals = () => {
  const dropdownItems = ["Action", "Another action", "Something else"];
  const RecentTransData = [
    {
      name: "Daniel Johnson",
      subtitle: "Money added",
      rank: "$6,235",
      disable: "",
      bgcolor: "secondary",
      img: "/images/profile/user-11.jpg",
    },
    {
      name: "John doe",
      subtitle: "Bill payment",
      rank: "$345",
      disable: "opacity-80",
      bgcolor: "success",
      img: "/images/profile/user-8.jpg",
    },
    {
      name: "Liam Smith",
      subtitle: "Money reversed",
      rank: "$2,235",
      disable: "",
      bgcolor: "warning",
      img: "/images/profile/user-3.jpg",
    },
    {
      name: "Emma White",
      subtitle: "Money added",
      rank: "$320",
      disable: "opacity-80",
      bgcolor: "primary",
      img: "/images/profile/user-4.jpg",
    },
    {
      name: "Olivia Brown",
      subtitle: "Bill Payment",
      rank: "$32",
      disable: "opacity-80",
      bgcolor: "error",
      img: "/images/profile/user-5.jpg",
    },
  ];
  return (
    <>
      <CardBox>
        <div className="flex items-center justify-between">
          <h5 className="card-title">Withdrawals</h5>
          <div>
            <Dropdown
              label=""
              dismissOnClick={false}
              renderTrigger={() => (
                <span className="h-9 w-9 flex justify-center items-center rounded-full hover:bg-lightprimary hover:text-primary cursor-pointer">
                  <HiOutlineDotsVertical size={22} />
                </span>
              )}
            >
              {dropdownItems.map((items, index) => {
                return <Dropdown.Item key={index}>{items}</Dropdown.Item>;
              })}
            </Dropdown>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          {RecentTransData.map((item, index) => (
            <div className="flex gap-3 items-center" key={index}>
              <div
                className={`h-10 w-10 shrink-0 rounded-full flex justify-center items-center relative bg-light${item.bgcolor} dark:bg-dark${item.bgcolor}`}
              >
                <Image src={item.img} fill alt="icon" className="h-6 w-6 rounded-full" />
              </div>
              <h5 className="text-base">{item.name}</h5>
              <div className={`ms-auto font-medium text-ld ${item.disable}`}>{item.rank}</div>
              <Button color={"red"} className="!size-8 w-fit text-xs">
                <LiaTimesSolid size={16} />
              </Button>
              <Button color={"success"} className=" !size-8 w-fit text-xs">
                <IoMdCheckmark size={16} />
              </Button>
            </div>
          ))}
        </div>
        <div className="border-t border-ld mt-6">
          <Button color={"primary"} className="w-full mt-7">
            View All Transactions
          </Button>
        </div>
      </CardBox>
    </>
  );
};

export default Withdrawals;
