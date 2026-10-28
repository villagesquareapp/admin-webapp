"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spinner } from "flowbite-react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import CardBox from "@/app/components/shared/CardBox";
import { Button } from "@/app/components/shared/Button";
import { runATCCycle } from "@/app/api/atc";

const ACTION_MESSAGE: Record<IATCCycleAction, string> = {
  created: "This month’s episode is live and applications are open.",
  already_set_up: "This month already has its episode.",
  window_closed: "This month’s applications have already closed, so it waits for next month. Start it yourself from Suggestions if you need to.",
  needs_staff: "This month needs a staff pick: approve one of the suggestions.",
  busy: "A check is already running. Try again in a moment.",
};

const day = (iso?: string | null, pattern = "d MMM") => {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), pattern);
  } catch {
    return iso;
  }
};

// The month the ATC tab is running: its episode, how it was picked, and the
// nightly check that sets up the next one.
const ATCCycleCard = ({ cycle }: { cycle: IATCCycle | null }) => {
  const router = useRouter();
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    const res = await runATCCycle();
    if (res?.status && res.data) {
      const msg = ACTION_MESSAGE[res.data.action] ?? "Checked";
      if (res.data.action === "needs_staff" || res.data.action === "window_closed") toast.warning(msg);
      else toast.success(msg);
      router.refresh();
    } else {
      toast.error(res?.message || "The check didn’t run");
    }
    setRunning(false);
  };

  if (!cycle) {
    return (
      <CardBox>
        <p className="text-sm text-darklink">The monthly cycle status isn’t available yet. It appears once the Admin API update is deployed.</p>
      </CardBox>
    );
  }

  const live = cycle.episode && cycle.episode.status === "active";
  const tone = live ? "success" : cycle.episode ? "warning" : "error";
  const TONE: Record<string, string> = {
    success: "bg-lightsuccess text-success",
    warning: "bg-lightwarning text-warning",
    error: "bg-lighterror text-error",
  };

  return (
    <CardBox className="overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center gap-5">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <span className={`size-12 rounded-xl grid place-items-center shrink-0 ${TONE[tone]}`}>
            <Icon icon={live ? "solar:cup-star-bold-duotone" : "solar:danger-triangle-bold-duotone"} height={26} />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs font-semibold uppercase tracking-wide text-darklink">{cycle.month.label}</p>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${TONE[tone]}`}>
                {live ? "Live" : cycle.episode ? `Episode ${cycle.episode.status}` : "No episode"}
              </span>
              {cycle.picked && (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${cycle.picked.auto ? "bg-lightsecondary text-secondary" : "bg-lightprimary text-primary"}`}>
                  {cycle.picked.auto ? "Picked automatically" : "Picked by staff"}
                </span>
              )}
            </div>
            <h4 className="text-lg font-bold mt-1 truncate">
              {cycle.episode?.name ?? "Applications are closed this month"}
            </h4>
            <p className="text-sm text-darklink mt-0.5">
              {cycle.episode
                ? `Runs ${day(cycle.episode.start_date)} – ${day(cycle.episode.end_date, "d MMM yyyy")}.`
                : "Nothing is set up yet. Run the check to set this month up now, or approve a suggestion."}
              {cycle.picked?.auto ? " You can swap the name for another suggestion." : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <Link href="/dashboards/africa-talent-challenge/suggestions">
            <Button color="light" size="sm" className="h-10">
              <Icon icon="solar:magic-stick-3-linear" height={16} className="me-1.5" /> Suggestions
            </Button>
          </Link>
          <Button color="primary" size="sm" className="h-10" onClick={run} disabled={running}>
            {running ? <Spinner size="sm" light /> : <Icon icon="solar:refresh-circle-linear" height={16} className="me-1.5" />}
            Run monthly check
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-5 border-t border-ld">
        <div>
          <p className="text-[11px] text-darklink">Suggestions this month</p>
          <p className="text-sm font-semibold mt-0.5">
            {cycle.suggestions.total ? `${cycle.suggestions.total} · ${cycle.suggestions.pending} pending` : "None yet"}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-darklink">Episode names</p>
          <p className={`text-sm font-semibold mt-0.5 ${cycle.ai_enabled ? "" : "text-warning"}`}>
            {cycle.ai_enabled ? "AI, standard list if it fails" : "Standard list (AI key not set)"}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-darklink">Next automatic check</p>
          <p className="text-sm font-semibold mt-0.5">{day(cycle.next_check_at, "d MMM · h:mm a")}</p>
        </div>
        <div>
          <p className="text-[11px] text-darklink">Live episode right now</p>
          <p className="text-sm font-semibold mt-0.5 truncate">{cycle.active_episode?.name ?? "None"}</p>
        </div>
      </div>
      <p className="text-[11px] text-darklink mt-4">
        Every night just after midnight (Lagos time) the month is checked. If it has no episode yet, five names are suggested and the first goes live, so applications open on the 1st without anyone stepping in. A month you set up yourself is left alone.
      </p>
    </CardBox>
  );
};

export default ATCCycleCard;
