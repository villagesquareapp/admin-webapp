"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "flowbite-react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import {
  generateATCSuggestions,
  approveATCSuggestion,
  rejectATCSuggestion,
  deleteATCSuggestions,
} from "@/app/api/atc";

const SUG_TONE: Record<string, string> = {
  pending: "bg-lightwarning text-warning",
  approved: "bg-lightsuccess text-success",
  rejected: "bg-lighterror text-error",
};

const SuggestionsView = ({ data }: { data: IATCData | null }) => {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const suggestions = data?.suggestions || [];
  const month = data?.current_month;
  const hasAny = suggestions.length > 0;
  const anApproved = data?.approved || suggestions.some((s) => s.status === "approved");

  const run = async (key: string, fn: () => Promise<any>, ok: string) => {
    setBusy(key);
    const res = await fn();
    if (res?.status) { toast.success(ok); router.refresh(); }
    else toast.error(res?.message || "Action failed");
    setBusy(null);
  };

  const regenerate = async () => {
    if (!month?.value) return;
    setBusy("gen");
    const del = await deleteATCSuggestions(month.value);
    if (!del?.status) { toast.error(del?.message || "Could not clear existing suggestions"); setBusy(null); return; }
    const gen = await generateATCSuggestions(month.value);
    if (gen?.status) { toast.success("Fresh suggestions generated"); router.refresh(); }
    else toast.error(gen?.message || "Generation failed");
    setBusy(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => router.push("/dashboards/africa-talent-challenge")} className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-darklink">
            <Icon icon="solar:alt-arrow-left-linear" height={20} />
          </button>
          <div>
            <h4 className="text-lg font-bold">AI episode suggestions</h4>
            <p className="text-sm text-darklink">
              Auto-generated monthly episode ideas{month?.label ? ` · ${month.label}` : ""}
              {hasAny ? ` · ${suggestions.length} suggested` : ""}
            </p>
          </div>
        </div>
        {!anApproved && (
          <div className="flex items-center gap-2 flex-wrap">
            {hasAny && (
              <Button color="light" size="sm" className="h-10" disabled={!!busy}
                onClick={() => run("del", () => deleteATCSuggestions(month?.value || ""), "Suggestions cleared")}>
                <Icon icon="solar:trash-bin-trash-linear" height={16} className="mr-1.5" /> Clear all
              </Button>
            )}
            <Button color="secondary" size="sm" className="h-10" disabled={busy === "gen"} isProcessing={busy === "gen"}
              onClick={hasAny ? regenerate : () => run("gen", () => generateATCSuggestions(month?.value), "Suggestions generated")}>
              <Icon icon="solar:magic-stick-3-bold" height={16} className="mr-1.5" /> {hasAny ? "Regenerate" : "Generate"}
            </Button>
          </div>
        )}
      </div>

      {anApproved && (
        <div className="flex items-center gap-2 text-sm text-success bg-lightsuccess/60 dark:bg-lightsuccess/10 rounded-xl px-4 py-2.5">
          <Icon icon="solar:check-circle-bold" height={16} /> An episode has been approved for {month?.label} from these suggestions.
        </div>
      )}

      {hasAny ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {suggestions.map((s) => (
            <CardBox key={s.uuid} className={`${s.status === "rejected" ? "opacity-60" : ""} ${s.status === "approved" ? "ring-2 ring-success" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`size-10 rounded-xl grid place-items-center shrink-0 ${s.status === "approved" ? "bg-lightsuccess text-success" : "bg-lightsecondary text-secondary"}`}>
                    <Icon icon={s.status === "approved" ? "solar:crown-star-bold" : "solar:magic-stick-3-bold"} height={20} />
                  </span>
                  <p className="text-sm font-bold truncate">{s.name}</p>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize shrink-0 ${SUG_TONE[s.status] || ""}`}>{s.status}</span>
              </div>
              <p className="text-xs text-darklink line-clamp-3 mt-2.5 break-words">{s.description}</p>
              {s.status === "pending" && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-ld">
                  <Button color="success" size="xs" disabled={!!busy} isProcessing={busy === `app-${s.uuid}`}
                    onClick={() => run(`app-${s.uuid}`, () => approveATCSuggestion(s.uuid), "Approved — episode created")}>
                    <Icon icon="solar:check-circle-bold" height={14} className="mr-1" /> Approve & create
                  </Button>
                  <Button color="light" size="xs" disabled={!!busy} isProcessing={busy === `rej-${s.uuid}`}
                    onClick={() => run(`rej-${s.uuid}`, () => rejectATCSuggestion(s.uuid), "Rejected")}>
                    Reject
                  </Button>
                </div>
              )}
            </CardBox>
          ))}
        </div>
      ) : (
        <CardBox>
          <div className="py-14 text-center">
            <Icon icon="solar:magic-stick-3-linear" height={40} className="mx-auto text-darklink" />
            <p className="text-sm text-darklink mt-3">No suggestions for this month yet.</p>
            <p className="text-xs text-darklink mt-1">Use “Generate” to create AI episode suggestions.</p>
          </div>
        </CardBox>
      )}
    </div>
  );
};

export default SuggestionsView;
