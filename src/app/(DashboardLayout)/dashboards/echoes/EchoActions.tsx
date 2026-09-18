"use client";

import { Dropdown } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { forceEndEcho } from "@/app/api/echo";
import { executeModeration } from "@/app/api/moderation";

const EchoActions = ({ echo }: { echo: IEchoes }) => {
  const router = useRouter();

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const moderate = async (action: string, label: string, confirm?: boolean) => {
    if (confirm && !window.confirm(`${label} — are you sure?`)) return;
    const res = await executeModeration({ service_type: "echo", target_id: echo.uuid, actions: [{ action }] });
    const result = (res?.data as { result?: string }[] | undefined)?.[0]?.result;
    if (res?.status && result === "executed") toast.success(label);
    else toast.error(res?.message || "Action failed");
    router.refresh();
  };

  const end = async () => {
    if (!window.confirm("End this echo now?")) return;
    const res = await forceEndEcho(echo.uuid);
    if (res?.status) toast.success("Echo ended");
    else toast.error(res?.message || "Failed to end echo");
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
        <Dropdown.Item onClick={() => router.push(`/dashboards/echoes/${echo.uuid}`)}>View details</Dropdown.Item>
        {(echo.status === "live" || echo.status === "scheduled") && (
          <Dropdown.Item onClick={end}>End echo now</Dropdown.Item>
        )}
        <Dropdown.Item onClick={() => moderate("limit_visibility", "Reach limited")}>Limit reach</Dropdown.Item>
        <Dropdown.Item onClick={() => moderate("remove_content", "Echo taken down", true)}>Take down</Dropdown.Item>
        <Dropdown.Item onClick={() => moderate("restore_content", "Echo restored")}>Restore</Dropdown.Item>
      </Dropdown>
    </div>
  );
};

export default EchoActions;
