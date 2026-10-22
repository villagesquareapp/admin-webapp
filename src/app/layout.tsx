import { CustomizerContextProvider } from "@/app/context/customizerContext";
import { themeModeScript } from "@/app/context/themeMode";
import customTheme from "@/utils/theme/custom-theme";
import { flowbite010Props, withFlowbite010Look } from "@/utils/theme/flowbite-0.10-look";
import { ThemeProvider } from "flowbite-react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";
import "../utils/i18n";
import "./css/globals.css";
import { Providers } from "./Providers";
import CustomToaster from "./components/shared/CustomToaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Village Square Admin Dashboard",
  description: "Software application for managing village square app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* Sets <html>'s dark class before the first paint (hence suppressHydrationWarning). */}
        <script dangerouslySetInnerHTML={{ __html: themeModeScript }} />
      </head>
      <body className={`${inter.className}`}>
        <Providers>
          {/* "replace": theme strings replace flowbite's defaults, as they did in 0.10. */}
          <ThemeProvider theme={withFlowbite010Look(customTheme)} props={flowbite010Props} applyTheme="replace">
            <CustomizerContextProvider>
              {children}
              <CustomToaster />
            </CustomizerContextProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
