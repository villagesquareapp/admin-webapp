"use client";

import { Drawer } from "flowbite-react";
import { Icon } from "@iconify/react";

interface Props {
  open: boolean;
  onClose: () => void;
  icon: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

// A right-hand panel for a list opened from a table or a detail page.
const SidePanel = ({ open, onClose, icon, title, subtitle, children }: Props) => (
  <Drawer open={open} onClose={onClose} position="right" className="z-[100] dark:bg-darkgray w-full max-w-[520px] p-0">
    {open && (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-ld">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="size-9 rounded-lg grid place-items-center shrink-0 bg-lightprimary text-primary">
              <Icon icon={icon} height={19} />
            </span>
            <div className="min-w-0">
              <h5 className="text-base font-semibold truncate">{title}</h5>
              {subtitle && <p className="text-[11px] text-darklink truncate">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-darklink hover:bg-lightgray dark:hover:bg-white/5" aria-label="Close">
            <Icon icon="solar:close-circle-linear" height={22} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    )}
  </Drawer>
);

export default SidePanel;
