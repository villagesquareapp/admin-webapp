import { Icon } from "@iconify/react";
import Image from "next/image";
import type { ReactNode } from "react";

const POINTS = [
  { icon: "solar:shield-check-line-duotone", text: "Moderation, reports and appeals" },
  { icon: "solar:wallet-money-line-duotone", text: "Payouts, coins and the ledger" },
  { icon: "solar:users-group-rounded-line-duotone", text: "Users, Trybes and support" },
];

// The sign-in screens' frame: a brand panel beside the form on wide screens,
// the form alone (with the wordmark) on narrow ones.
export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-white dark:bg-dark">
      <aside className="relative hidden lg:flex w-[44%] max-w-[640px] flex-col justify-between overflow-hidden bg-[#141414] p-12 text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.35] [background-image:radial-gradient(rgba(255,255,255,0.13)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
        />
        <Image src="/vs_images/vs_wordmark_on_dark.png" alt="VillageSquare" width={210} height={22} priority className="relative" />

        <div className="relative max-w-[420px]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Staff console</p>
          <h1 className="mt-4 text-[34px] font-semibold leading-[1.15] tracking-tight text-white">
            Everything that keeps the square running.
          </h1>
          <ul className="mt-10 space-y-4">
            {POINTS.map((p) => (
              <li key={p.text} className="flex items-center gap-3 text-[15px] text-white/75">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/[0.07] ring-1 ring-white/10">
                  <Icon icon={p.icon} width={19} className="text-white/85" />
                </span>
                {p.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/45">
          Staff only. Sign-ins and staff actions are recorded.
        </p>
      </aside>

      <main className="flex flex-1 flex-col px-6 py-10 sm:px-10">
        <div className="lg:hidden mb-10">
          <Image src="/vs_images/vs_wordmark_on_light.png" alt="VillageSquare" width={180} height={19} priority className="dark:hidden" />
          <Image src="/vs_images/vs_wordmark_on_dark.png" alt="VillageSquare" width={180} height={19} priority className="hidden dark:block" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
        <p className="mt-10 text-center text-xs text-darklink">© {new Date().getFullYear()} VillageSquare</p>
      </main>
    </div>
  );
}
