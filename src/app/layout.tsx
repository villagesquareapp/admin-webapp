import { CustomizerContextProvider } from "@/app/context/customizerContext";
import customTheme from "@/utils/theme/custom-theme";
import { Flowbite, ThemeModeScript } from "flowbite-react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";
import "../utils/i18n";
import "./api/index";
import "./css/globals.css";
import { Providers } from "./Providers";
import CustomToaster from "./(DashboardLayout)/ui-components/custom/custom-toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Village Square Admin Dashboard",
  description: "Software application for managing village square app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <ThemeModeScript />
      </head>
      <body className={`${inter.className}`}>
        <Providers>
          <Flowbite theme={{ theme: customTheme }}>
            <CustomizerContextProvider>
              {children}
              <CustomToaster />
            </CustomizerContextProvider>
          </Flowbite>
        </Providers>
      </body>
    </html>
  );
}
