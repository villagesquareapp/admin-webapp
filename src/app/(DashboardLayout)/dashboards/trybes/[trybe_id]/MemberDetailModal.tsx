"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Modal, ModalBody, ModalHeader, Spinner } from "flowbite-react";
import { getTrybeMember } from "@/app/api/trybes";
import { formatDate } from "@/utils/dateUtils";
import { Chip, KV, Person, label } from "../trybeUi";

// One person in a Trybe: membership, join requests, posts there, and
// reports about them there.
const MemberDetailModal = ({
  trybeId,
  userId,
  onClose,
}: {
  trybeId: string;
  userId: string | null;
  onClose: () => void;
}) => {
  const [member, setMember] = useState<ITrybeMemberDetail | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let live = true;
    setMember(null);
    setFailed(false);
    getTrybeMember(trybeId, userId)
      .then((res) => {
        if (!live) return;
        if (res?.data) setMember(res.data);
        else setFailed(true);
      })
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [trybeId, userId]);

  return (
    <Modal show={!!userId} onClose={onClose} size="3xl" dismissible>
      <ModalHeader>{member ? member.name || member.username : "Member"}</ModalHeader>
      <ModalBody>
        {!member && !failed && (
          <div className="py-10 grid place-items-center">
            <Spinner />
          </div>
        )}
        {failed && <p className="text-sm text-darklink">Couldn&apos;t load this member.</p>}
        {member && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <Person user={member} />
              <div>
                <KV name="Role" value={<Chip value={member.role} />} />
                <KV name="Status" value={<Chip value={member.status} />} />
                <KV name="Joined" value={`${formatDate(member.joined_at)} · ${member.joined_via === "staff" ? "added by staff" : "by request"}`} />
                {member.ended_at && (
                  <KV
                    name="Left"
                    value={`${formatDate(member.ended_at)}${member.ended_by ? ` · by ${member.ended_by.name || "unknown"}` : ""}`}
                  />
                )}
                <KV name="Last visit" value={member.last_seen_at ? formatDate(member.last_seen_at) : "Never"} />
                <KV name="Notifications" value={member.notifications_enabled ? "On" : "Off (bell muted)"} />
                <KV name="Email" value={member.email} />
                <KV name="Account" value={label(member.account_status)} />
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">Join requests</p>
                {member.requests.length === 0 && <p className="text-sm text-darklink">None (added by staff).</p>}
                <div className="flex flex-col gap-2">
                  {member.requests.map((r) => (
                    <Link
                      key={r.uuid}
                      href={`/dashboards/trybes/requests/${r.uuid}`}
                      className="rounded-lg border border-border dark:border-darkborder p-2.5 hover:border-primary"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm">{r.answers?.matric_no} · {r.answers?.level}</span>
                        <Chip value={r.status} />
                      </div>
                      <p className="text-xs text-darklink">
                        {r.answers?.department} · sent {formatDate(r.created_at)}
                        {r.rejection_reason ? ` · "${r.rejection_reason}"` : ""}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-semibold">
                  Posts here <span className="text-darklink font-normal">({member.posts.total}, {member.posts.top_level} not replies)</span>
                </p>
                {member.posts.recent.length === 0 && <p className="text-sm text-darklink mt-2">No posts in this Trybe.</p>}
                <div className="flex flex-col gap-2 mt-2">
                  {member.posts.recent.map((p) => (
                    <Link
                      key={p.uuid}
                      href={`/dashboards/posts/${p.uuid}`}
                      className="rounded-lg border border-border dark:border-darkborder p-2.5 hover:border-primary"
                    >
                      <p className="text-sm line-clamp-2">{p.caption || "(no text)"}</p>
                      <p className="text-xs text-darklink">
                        {p.parent_post_id ? "Reply" : "Post"}
                        {p.is_anonymous ? " · anonymous" : ""} · {p.likes_count} likes · {p.replies_count} replies ·{" "}
                        {formatDate(p.created_at)}
                        {p.status !== "active" ? ` · ${label(p.status)}` : ""}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold">
                  Reports about them here <span className="text-darklink font-normal">({member.reports.total}, {member.reports.open} open)</span>
                </p>
                {member.reports.recent.length === 0 && <p className="text-sm text-darklink mt-2">No reports.</p>}
                <div className="flex flex-col gap-2 mt-2">
                  {member.reports.recent.map((r) => (
                    <Link
                      key={r.uuid}
                      href={`/dashboards/reports/${r.uuid}`}
                      className="rounded-lg border border-border dark:border-darkborder p-2.5 hover:border-primary"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm">{r.service_type === "user" ? "About them" : `About their ${r.service_type}`}</span>
                        <Chip value={r.status} />
                      </div>
                      <p className="text-xs text-darklink">
                        {r.reason || "No details"} · {formatDate(r.created_at)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};

export default MemberDetailModal;
