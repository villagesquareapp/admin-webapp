

import { Sidebar, SidebarCollapse, SidebarItemGroup } from "flowbite-react";
import React from "react";
import { ChildItem } from "../Sidebaritems";
import NavItems from "../NavItems";
import { Icon } from "@iconify/react";
import { HiOutlineChevronDown } from "react-icons/hi";
import { twMerge } from "tailwind-merge";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/utils/permissions";

interface NavCollapseProps {
  item: ChildItem;
}

const NavCollapse: React.FC<NavCollapseProps> = ({ item }: any) => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { can } = usePermissions();
  const children = item.children.filter((c: ChildItem) => !c.permission || can(c.permission));
  // A group with only one page the staff member can open shows as that page.
  if (!children.length) return null;
  if (children.length === 1 && !children[0].children) return <NavItems item={children[0]} />;
  const activeDD = children.find((t: { url: string; }) => t.url === pathname)
  return (
    <>
      <SidebarCollapse
        label={t(`${item.name}`)}
        open={activeDD ? true : false}
        icon={() => <Icon icon={item.icon} height={18} />}
        className={activeDD ? '!text-primary bg-lightprimary ' : ''}
        renderChevronIcon={(theme, open) => {
          const IconComponent = open
            ? HiOutlineChevronDown
            : HiOutlineChevronDown;
          return (
            <IconComponent
              aria-hidden
              className={twMerge(theme.label.icon.open[open ? "on" : "off"])}
            />
          );
        }}
      >
        {/* Render child items */}
        {children.length > 0 && (
          <SidebarItemGroup className="sidebar-dropdown">
            {children.map((child: any) => (
              <React.Fragment key={child.id}>
                {/* Render NavItems for child items */}
                {child.children ? (
                  <NavCollapse item={child}  /> // Recursive call for nested collapse
                ) : (
                  <NavItems item={child} />
                )}
              </React.Fragment>
            ))}
          </SidebarItemGroup>
        )}
      </SidebarCollapse>
    </>
  );
};

export default NavCollapse;
