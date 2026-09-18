"use client";

import { Dropdown } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { forceEndLivestream } from "@/app/api/livestream";
import { executeModeration } from "@/app/api/moderation";

const LivestreamActions = ({ stream }: { stream: ILivestreams }) => {
  const router = useRouter();
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const moderate = async (action: string, label: string, confirm?: boolean) => {
    if (confirm && !window.confirm(`${label} — are you sure?`)) return;
    const res = await executeModeration({ service_type: "livestream", target_id: stream.uuid, actions: [{ action }] });
    const result = (res?.data as { result?: string }[] | undefined)?.[0]?.result;
    if (res?.status && result === "executed") toast.success(label);
    else toast.error(res?.message || "Action failed");
    router.refresh();
  };

  const end = async () => {
    if (!window.confirm("End this livestream now?")) return;
    const res = await forceEndLivestream(stream.uuid);
    if (res?.status) toast.success("Livestream ended");
    else toast.error(res?.message || "Failed to end stream");
    router.refresh();
  };

  return (
    <div className="flex justify-end" onClick={stop}>
      <Dropdown
        label=""
        inline
        dismissOnClick={false}
        renderTrigger={() => (
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <HiOutlineDotsVertical className="text-lg" />
          </button>
        )}
      >
        <Dropdown.Item onClick={() => router.push(`/dashboards/livestreams/${stream.uuid}`)}>View details</Dropdown.Item>
        {(stream.status === "live" || stream.status === "scheduled") && (
          <Dropdown.Item onClick={end}>End stream now</Dropdown.Item>
        )}
        <Dropdown.Item onClick={() => moderate("remove_content", "Stream taken down", true)}>Take down</Dropdown.Item>
        <Dropdown.Item onClick={() => moderate("restore_content", "Stream restored")}>Restore</Dropdown.Item>
      </Dropdown>
    </div>
  );
};

export default LivestreamActions;
