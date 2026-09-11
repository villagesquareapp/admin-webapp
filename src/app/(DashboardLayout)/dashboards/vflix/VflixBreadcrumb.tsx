"use client";

import CardBox from "@/app/components/shared/CardBox";
import { Badge, Breadcrumb } from "flowbite-react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BreadcrumbItem {
  to?: string;
  title: string;
}

/**
 * VFlix breadcrumb. Unlike the shared MyBreadcrumbComp (whose back arrow is
 * tied to the Users `userId` param flow), this one's back arrow actually
 * navigates — to `backTo` if provided, otherwise to the last item that has a
 * link, otherwise the browser's history.
 */
const VflixBreadcrumb = ({
  title,
  items,
  backTo,
}: {
  title: string;
  items: BreadcrumbItem[];
  backTo?: string;
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (backTo) {
      router.push(backTo);
      return;
    }
    const parent = [...items].reverse().find((item) => item.to);
    if (parent?.to) {
      router.push(parent.to);
    } else {
      router.back();
    }
  };

  return (
    <CardBox className="mb-[30px]">
      <Breadcrumb className="flex justify-between">
        <div className="flex items-center gap-3">
          <Icon
            icon="solar:arrow-left-line-duotone"
            height={25}
            className="cursor-pointer"
            onClick={handleBack}
          />
          <h6 className="text-base">{title}</h6>
        </div>
        <div className="flex items-center gap-3 ms-auto">
          {items.map((item) => (
            <div key={item.title}>
              {item.to ? (
                <Breadcrumb.Item>
                  <Link href={item.to} className="flex items-center">
                    <Icon icon="solar:home-2-line-duotone" height={20} />
                    <span className="ms-3">/</span>
                  </Link>
                </Breadcrumb.Item>
              ) : (
                <Badge color="lightprimary">{item.title}</Badge>
              )}
            </div>
          ))}
        </div>
      </Breadcrumb>
    </CardBox>
  );
};

export default VflixBreadcrumb;
