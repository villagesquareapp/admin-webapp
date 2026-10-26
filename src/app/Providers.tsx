"use client";

import { SessionProvider, signOut, useSession } from "next-auth/react";
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { useEffect } from "react";

// Signs the browser out once the Admin API has ended the session (signed out
// elsewhere, deactivated, password or authenticator reset, 12 hours up).
function SessionWatcher() {
  const { data } = useSession();
  useEffect(() => {
    if (data?.error) signOut({ callbackUrl: "/auth/auth2/login" });
  }, [data?.error]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // Refetching every 4 minutes renews the 15-minute API token in the cookie.
    <SessionProvider refetchInterval={240} refetchOnWindowFocus>
      <SessionWatcher />
      {children}
      <ProgressBar
        height="3px"
        color="#3b82f6"
        options={{ showSpinner: false }}
        shallowRouting
      />
    </SessionProvider>
  );
}
