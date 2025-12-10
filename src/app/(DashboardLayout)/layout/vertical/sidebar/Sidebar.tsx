"use client";

import { CustomizerContext } from "@/app/context/customizerContext";
import { Sidebar } from "flowbite-react";
import { usePathname } from "next/navigation";
import React, { useContext, useEffect } from "react";
import SimpleBar from "simplebar-react";
import Logo from "../../shared/logo/Logo";
import NavCollapse from "./NavCollapse";
import NavItems from "./NavItems";
import SidebarContent from "./Sidebaritems";

const SidebarLayout = () => {
  const { selectedIconId, setSelectedIconId } = useContext(CustomizerContext) || {};
  const selectedContent = SidebarContent.find((data) => data.id === selectedIconId);

  const pathname = usePathname();

  function findActiveUrl(narray: any, targetUrl: any) {
    for (const item of narray) {
      // Check if the `items` array exists in the top-level object
      if (item.items) {
        // Iterate through each item in the `items` array
        for (const section of item.items) {
          // Check if `children` array exists and search through it
          if (section.children) {
            for (const child of section.children) {
              if (child.url === targetUrl) {
                return item.id; // Return the ID of the first-level object
              }
            }
          }
        }
      }
    }
    return null; // URL not found
  }

  const result = findActiveUrl(SidebarContent, pathname);

  // useEffect(() => {
  //   setSelectedIconId(result);
  // }, []);

    useEffect(() => {
    if (result !== null) {
      setSelectedIconId(result);
    } else if (!selectedIconId) {
      // Set default to first item if no match and no selection
      setSelectedIconId(SidebarContent[0]?.id || 1);
    }
  }, [result, selectedIconId, setSelectedIconId]);

  // Use the found content or default to first item
  const contentToDisplay = selectedContent || SidebarContent[0];

  return (
    <>
      <div className="xl:block hidden">
        {/* <div className="minisidebar-icon border-e border-ld bg-white dark:bg-darkgray fixed start-0 z-[1]">
          <IconSidebar />
          <SideProfile />
        </div> */}
        <Sidebar
          className="fixed menu-sidebar pt-6 bg-white dark:bg-darkgray ps-4 rtl:pe-4 rtl:ps-0"
          aria-label="Sidebar with multi-level dropdown example"
        >
          <SimpleBar className="h-[calc(100vh_-_85px)]">
            <Sidebar.Items className="pe-4 rtl:pe-0 rtl:ps-4">
              <Sidebar.ItemGroup className="sidebar-nav hide-menu">
                <div className="flex items-center gap-3">
                  <Logo size={40} />{" "}
                  <p className="text-lg font-bold text-black dark:text-white">
                    Village Square
                  </p>
                </div>
                {contentToDisplay &&
                  contentToDisplay.items?.map((item, index) => (
                    <React.Fragment key={index}>
                      <h5 className="text-link font-semibold text-sm caption">
                        {item.heading}
                      </h5>
                      {item.children?.map((child, index) => (
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
              </Sidebar.ItemGroup>
            </Sidebar.Items>
          </SimpleBar>
        </Sidebar>
      </div>
    </>
  );
};

export default SidebarLayout;
