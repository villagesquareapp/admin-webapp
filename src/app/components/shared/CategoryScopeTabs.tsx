"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Label, Select } from "flowbite-react";
import CardBox from "./CardBox";
import { GENERAL_CATEGORY_SCOPE } from "@/utils/categoryScope";

type Tab = "general" | "trybes";

const DEFAULT_NOTES: Record<Tab, string> = {
  general: "Shown everywhere outside Trybes.",
  trybes: "The only categories shown inside Trybes of this type. A new type starts with a copy of the General ones.",
};

const TABS: { value: Tab; label: string; icon: string }[] = [
  { value: "general", label: "General", icon: "solar:global-line-duotone" },
  { value: "trybes", label: "Trybes", icon: "solar:users-group-two-rounded-line-duotone" },
];

// General / Trybes tabs over a categories table. The selection lives in ?type=
// so the server page fetches the matching list.
const CategoryScopeTabs = ({
  trybeTypes,
  type,
  notes = DEFAULT_NOTES,
  children,
}: {
  trybeTypes: ITrybeType[];
  type: string;
  notes?: Record<Tab, string>;
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const urlTab: Tab = type === GENERAL_CATEGORY_SCOPE ? "general" : "trybes";
  // Kept locally too, so the Trybes tab can open with no Trybe types to put in the URL.
  const [tab, setTab] = useState<Tab>(urlTab);

  useEffect(() => setTab(urlTab), [urlTab]);

  const go = (next: string) =>
    startTransition(() => router.replace(`?${new URLSearchParams({ type: next })}`, { scroll: false }));

  const selectTab = (next: Tab) => {
    if (next === tab) return;
    setTab(next);
    // The URL may still be on this tab while a switch away is loading.
    if (next === urlTab && !pending) return;
    if (next === "general") go(GENERAL_CATEGORY_SCOPE);
    else if (urlTab === "trybes") go(type);
    else if (trybeTypes.length) go(trybeTypes[0].uuid);
  };

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label="Category scope" className="flex flex-wrap -mb-px border-b border-ld dark:border-gray-700">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => selectTab(t.value)}
            className={`flex items-center gap-2 rounded-t-lg p-4 text-sm border-b-2 focus:outline-none ${
              tab === t.value
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <Icon icon={t.icon} height={18} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "trybes" && !trybeTypes.length ? (
        <CardBox>
          <div className="py-16 text-center text-darklink">
            <Icon icon="solar:users-group-two-rounded-linear" height={40} className="mx-auto mb-3" />
            <p>There are no Trybe types yet, so there are no Trybe categories to manage.</p>
            <Link href="/dashboards/trybes/types" className="text-primary text-sm font-semibold mt-3 inline-block">
              Manage Trybe types
            </Link>
          </div>
        </CardBox>
      ) : (
        <>
          {tab === "trybes" && (
            <div className="flex flex-wrap items-center gap-3">
              <Label htmlFor="category-trybe-type">Trybe type</Label>
              <div className="min-w-[220px]">
                <Select
                  id="category-trybe-type"
                  value={urlTab === "trybes" ? type : ""}
                  onChange={(e) => e.target.value && go(e.target.value)}
                  disabled={pending}
                >
                  {urlTab !== "trybes" && (
                    <option value="" disabled>
                      Loading…
                    </option>
                  )}
                  {trybeTypes.map((t) => (
                    <option key={t.uuid} value={t.uuid}>
                      {t.name}
                      {t.is_enabled ? "" : " (disabled)"}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          )}
          <p className="text-sm text-darklink">{notes[tab]}</p>
          {tab === urlTab ? (
            <div className={`transition-opacity ${pending ? "opacity-60 pointer-events-none" : ""}`}>{children}</div>
          ) : (
            <div className="h-[400px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />
          )}
        </>
      )}
    </div>
  );
};

export default CategoryScopeTabs;
