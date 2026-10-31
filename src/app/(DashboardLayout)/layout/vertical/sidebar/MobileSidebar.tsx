"use client";
import { CustomizerContext } from "@/app/context/customizerContext";
import { Sidebar, SidebarItemGroup, SidebarItems } from "flowbite-react";
import React, { useContext } from "react";
import SimpleBar from "simplebar-react";
import Logo from "../../shared/logo/Logo";
import NavCollapse from "./NavCollapse";
import NavItems from "./NavItems";
import SidebarContent from "./Sidebaritems";
import { usePermissions } from "@/utils/permissions";

const MobileSidebar = () => {
  const { can } = usePermissions();
  const { selectedIconId, setSelectedIconId } = useContext(CustomizerContext) || {};
  const selectedContent = SidebarContent.find((data) => data.id === selectedIconId);
  return (
    <>
      <div>
        {/* <div className="minisidebar-icon border-e border-ld bg-white dark:bg-darkgray fixed start-0 z-[1]">
          <IconSidebar />
          <SideProfile/>
        </div> */}
        <Sidebar
          className="fixed menu-sidebar pt-8 bg-white dark:bg-darkgray transition-all"
          aria-label="Sidebar with multi-level dropdown example"
        >
          <SimpleBar className="h-[calc(100vh_-_85px)]">
            <SidebarItems className="ps-4 pe-4">
              <SidebarItemGroup className="sidebar-nav">
                <div className="flex items-center gap-3">
                  <Logo size={40} />{" "}
                  <p className="text-lg font-bold text-black dark:text-white">
                    Village Square
                  </p>
                </div>
                {selectedContent &&
                  selectedContent.items?.map((item, index) => (
                    <React.Fragment key={index}>
                      <h5 className="text-link font-semibold text-xs caption">
                        {item.heading}
                      </h5>
                      {item.children?.filter((child) => !child.permission || can(child.permission)).map((child, index) => (
                        <React.Fragment key={child.id && index}>
                          {child.children ? (
                            <NavCollapse item={child} />
                          ) : (
                            <NavItems item={child} />
                          )}
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  ))}
              </SidebarItemGroup>
            </SidebarItems>
          </SimpleBar>
        </Sidebar>
      </div>
    </>
  );
};

export default MobileSidebar;
