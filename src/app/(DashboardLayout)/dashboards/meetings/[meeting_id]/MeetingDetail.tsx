"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "flowbite-react";
import { Button } from "@/app/components/shared/Button";
import { toast } from "sonner";
import { endMeeting } from "@/app/api/meetings";
import CardBox from "@/app/components/shared/CardBox";
import { KV } from "../../trybes/trybeUi";
import { endedByLabel, fmtClock, fmtDuration, fmtTime, LateChip, PersonCell, RoleChip, StatusChip, usd } from "../meetingsUi";

const MeetingDetail = ({ meeting: m }: { meeting: IMeetingDetail }) => {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [ending, setEnding] = useState(false);
  const late = m.participants.filter((p) => p.late);
  const lateAfter = m.starts_at ? new Date(new Date(m.starts_at).getTime() + m.grace_min * 60_000).toISOString() : null;

  const end = async () => {
    setEnding(true);
    try {
      const res = await endMeeting(m.uuid);
      if (res?.status) {
        toast.success("Meeting ended for everyone");
        setConfirm(false);
        router.refresh();
      } else toast.error(res?.message || "Couldn't end the meeting");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setEnding(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href="/dashboards/meetings/list" className="text-sm text-darklink inline-flex items-center gap-1 mb-1">
            <Icon icon="solar:alt-arrow-left-linear" height={16} /> All meetings
          </Link>
          <h4 className="text-lg font-bold flex items-center gap-3">
            {m.title} <StatusChip status={m.status} />
          </h4>
          <p className="text-sm text-darklink">
            {m.code} · {m.participants.length} {m.participants.length === 1 ? "person" : "people"} ·{" "}
            {fmtDuration(m.duration_sec)}
          </p>
        </div>
        {m.status === "live" && (
          <Button color="failure" onClick={() => setConfirm(true)}>
            End meeting
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <CardBox>
          <p className="text-sm font-semibold mb-2">Details</p>
          <KV name="Host" value={<PersonCell person={m.host} />} />
          <KV name="Started" value={fmtTime(m.started_at)} />
          <KV name="Ended" value={m.ended_at ? `${fmtTime(m.ended_at)}` : "Still live"} />
          {m.ended_by && <KV name="How it ended" value={endedByLabel(m.ended_by)} />}
          <KV name="Length" value={fmtDuration(m.duration_sec)} />
        </CardBox>
        <CardBox>
          <p className="text-sm font-semibold mb-2">Latecomer check-in</p>
          <KV name="AI PM" value={m.latecomer_check_in ? "On" : "Off"} />
          <KV name="Meant to start" value={fmtTime(m.starts_at)} />
          <KV name="Grace" value={`${m.grace_min} min`} />
          {m.latecomer_check_in && <KV name="Late after" value={fmtClock(lateAfter)} />}
          <KV name="Came late" value={late.length} />
        </CardBox>
        <CardBox>
          <p className="text-sm font-semibold mb-2">AI PM usage</p>
          <KV name="Led by the PM" value={m.pm_lead ? `Yes, ${m.minutes_per_person} min per person` : "No"} />
          <KV name="Calls" value={m.assistant_usage.calls} />
          <KV name="Failed" value={m.assistant_usage.failed} />
          <KV name="Spoken" value={`${m.assistant_usage.tts_chars.toLocaleString()} characters`} />
          <KV name="Listened" value={`${Math.round(m.assistant_usage.stt_seconds)} s`} />
          <KV name="Estimated cost" value={usd(m.assistant_usage.est_cost_usd)} />
          {m.pm_lead && <KV name="Of which Claude" value={usd(m.assistant_usage.claude_cost_usd)} />}
        </CardBox>
      </div>

      {m.pm_lead && (
        <CardBox>
          <p className="text-sm font-semibold mb-2">PM&apos;s notes</p>
          {m.agenda && <p className="text-xs text-darklink mb-2">Topics: {m.agenda.split("\n").join(" · ")}</p>}
          {m.pm_notes ? (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.pm_notes}</p>
          ) : (
            <p className="text-sm text-darklink">
              {m.status === "live" ? "The PM writes its notes when the meeting ends." : "No notes for this meeting."}
            </p>
          )}
        </CardBox>
      )}

      {late.length > 0 && (
        <CardBox>
          <p className="text-sm font-semibold mb-3">Who came late, and why</p>
          <div className="flex flex-col gap-3">
            {late.map((p) => (
              <div key={p.identity} className="rounded-lg border border-border dark:border-darkborder p-3">
                <p className="text-sm font-medium">
                  {p.display_name} <span className="text-darklink font-normal">· joined {fmtClock(p.joined_at)}</span>
                </p>
                <p className="text-sm mt-1">
                  {p.late_reason ? <>&ldquo;{p.late_reason}&rdquo;</> : <span className="text-darklink">No answer.</span>}
                </p>
                {p.pm_reply && <p className="text-xs text-darklink mt-1">PM: {p.pm_reply}</p>}
              </div>
            ))}
          </div>
        </CardBox>
      )}

      <CardBox>
        <p className="text-sm font-semibold mb-3">Attendance</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-darklink border-b border-border dark:border-darkborder">
                <th className="py-2 pr-3 font-medium">Name</th>
                <th className="py-2 pr-3 font-medium">Role</th>
                <th className="py-2 pr-3 font-medium">Joined</th>
                <th className="py-2 pr-3 font-medium">Left</th>
                <th className="py-2 pr-3 font-medium">Time in</th>
              </tr>
            </thead>
            <tbody>
              {m.participants.map((p) => (
                <tr key={p.identity} className="border-b border-border dark:border-darkborder last:border-0">
                  <td className="py-2.5 pr-3">
                    <span className="font-medium">{p.display_name}</span> {p.late && <LateChip />}
                  </td>
                  <td className="py-2.5 pr-3">
                    <RoleChip role={p.role} />
                  </td>
                  <td className="py-2.5 pr-3 whitespace-nowrap text-darklink">{fmtClock(p.joined_at)}</td>
                  <td className="py-2.5 pr-3 whitespace-nowrap text-darklink">
                    {p.left_at ? fmtClock(p.left_at) : m.status === "live" ? "In the room" : "—"}
                  </td>
                  <td className="py-2.5 pr-3 tabular-nums">{fmtDuration(p.duration_sec)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBox>

      <Modal show={confirm} onClose={() => !ending && setConfirm(false)} size="md">
        <ModalHeader>End this meeting?</ModalHeader>
        <ModalBody>
          <p className="text-sm">
            Everyone in <b>{m.title}</b> is disconnected and the room closes. The host can start a new meeting
            afterwards.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="gray" onClick={() => setConfirm(false)} disabled={ending}>
            Cancel
          </Button>
          <Button color="failure" onClick={end} disabled={ending}>
            {ending && <Spinner size="sm" light />}
            End meeting
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default MeetingDetail;
