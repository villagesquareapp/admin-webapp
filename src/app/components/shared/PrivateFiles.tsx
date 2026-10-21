"use client";

import { useEffect, useState } from "react";
import { Spinner } from "flowbite-react";
import { Button } from "@/app/components/shared/Button";
import { toast } from "sonner";
import { getPostOriginals } from "@/app/api/report";

// Short-lived private links: fetched on demand (each opening is logged),
// hidden again when they expire.
export function usePrivateLinks<T>(fetcher: () => Promise<{ status: boolean; message?: string; data?: T & { expires_in: number } }>) {
  const [data, setData] = useState<T | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  useEffect(() => {
    if (expiresAt && now >= expiresAt) {
      setData(null);
      setExpiresAt(null);
    }
  }, [now, expiresAt]);

  const open = async () => {
    setLoading(true);
    try {
      const res = await fetcher();
      if (res?.status && res.data) {
        setData(res.data);
        setExpiresAt(Date.now() + (res.data.expires_in - 10) * 1000);
        setNow(Date.now());
      } else toast.error(res?.message || "Couldn't open the files");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const secondsLeft = expiresAt ? Math.max(0, Math.round((expiresAt - now) / 1000)) : 0;
  return { data, open, loading, secondsLeft };
}

export const PrivatePicture = ({ url, label }: { url: string | null; label: string }) =>
  url ? (
    <a href={url} target="_blank" rel="noreferrer noopener" className="block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={label}
        referrerPolicy="no-referrer"
        className="h-48 w-full rounded-xl object-contain bg-lightgray dark:bg-dark border border-border dark:border-darkborder"
      />
    </a>
  ) : (
    <div className="h-48 rounded-xl border border-dashed border-border dark:border-darkborder grid place-items-center text-sm text-darklink">
      Not available
    </div>
  );

// An anonymous post's original uploads, for staff only.
export const PostOriginals = ({ postId }: { postId: string }) => {
  const links = usePrivateLinks(() => getPostOriginals(postId));
  return (
    <div className="mt-4 rounded-md border border-border dark:border-darkborder p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">Original uploads</p>
        {links.data ? (
          <span className="text-xs text-darklink">Links expire in {links.secondsLeft}s</span>
        ) : (
          <Button size="xs" color="light" onClick={links.open} disabled={links.loading}>
            {links.loading && <Spinner size="sm" light />}
            Open originals
          </Button>
        )}
      </div>
      <p className="text-xs text-darklink mt-1">
        The files as uploaded, before location and device details were removed. Opening them is logged.
      </p>
      {links.data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          {links.data.originals.map((o) =>
            o.media_type === "image" ? (
              <PrivatePicture key={o.media_id} url={o.url} label="Original" />
            ) : (
              <a
                key={o.media_id}
                href={o.url ?? "#"}
                target="_blank"
                rel="noreferrer noopener"
                className="h-48 rounded-xl border border-border dark:border-darkborder grid place-items-center text-sm text-primary font-semibold"
              >
                Open original {o.media_type}
              </a>
            )
          )}
        </div>
      )}
    </div>
  );
};

