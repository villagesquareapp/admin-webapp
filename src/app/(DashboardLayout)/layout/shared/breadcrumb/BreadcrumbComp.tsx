"use client";
import React from "react";
import { Badge, Breadcrumb } from "flowbite-react";
import CardBox from "@/app/components/shared/CardBox";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

interface BreadCrumbType {
  subtitle?: string;
  items?: any[];
  title: string;
  children?: JSX.Element;
}

const BreadcrumbComp = ({ items, title }: BreadCrumbType) => {
  const router = useRouter();

  return (
    <>
      <CardBox className={`mb-[30px]`}>
        <Breadcrumb className="flex justify-between">
          <div className="flex items-center gap-3">
            <Icon
              icon="solar:arrow-left-line-duotone"
              height={25}
              className="cursor-pointer"
              onClick={() => router.back()}
            />
            <h6 className="text-base">{title}</h6>
          </div>
          <div className="flex items-center gap-3 ms-auto">
            {items
              ? items.map((item) => (
                  <div key={item.title}>
                    {item.to ? (
                      <Breadcrumb.Item href={item.to}>
                        <Icon icon="solar:home-2-line-duotone" height={20}></Icon>{" "}
                        <span className="ms-3">/</span>
                      </Breadcrumb.Item>
                    ) : (
                      <Badge color={"lightprimary"}>{item.title}</Badge>
                    )}
                  </div>
                ))
              : ""}
          </div>
        </Breadcrumb>
      </CardBox>
    </>
  );
};

export default BreadcrumbComp;
