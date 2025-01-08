"use client";
import React, { useContext } from "react";
import Sidebar from "./layout/vertical/sidebar/Sidebar";
import Header from "./layout/vertical/header/Header";
import { Customizer } from "./layout/shared/customizer/Customizer";
import { CustomizerContext } from "@/app/context/customizerContext";
import Logo from "./layout/shared/logo/Logo";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { activeLayout, isLayout, isCollapse } = useContext(CustomizerContext);

  return (
    <div className="flex w-full min-h-screen">
      {isCollapse == "mini-sidebar" ? (
        <div className="flex fixed left-4 top-5 items-center gap-3 ">
          <Logo size={40} />{" "}
        </div>
      ) : null}
      <div className="page-wrapper flex w-full">
        {/* Header/sidebar */}
        {activeLayout == "vertical" ? <Sidebar /> : null}
        <div className="body-wrapper w-full bg-lightgray dark:bg-dark">
          {/* Top Header  */}
          {activeLayout == "horizontal" ? (
            <Header layoutType="horizontal" />
          ) : (
            <Header layoutType="vertical" />
          )}

          {/* Body Content  */}
          <div
            className={` ${
              isLayout == "full"
                ? "w-full py-[30px] md:px-[30px] px-5"
                : "container mx-auto  py-[30px]"
            } ${activeLayout == "horizontal" ? "xl:mt-3" : ""}
            `}
          >
            {children}
          </div>
          <Customizer />
        </div>
      </div>
    </div>
  );
}
