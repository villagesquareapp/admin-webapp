"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, Spinner } from "flowbite-react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import { Button } from "@/app/components/shared/Button";
import { setFeedbackReviewed, convertFeedbackToTicket } from "@/app/api/feedback";
import { Person } from "../../trybes/trybeUi";

const STATUS_COLOR: Record<string, string> = {
  active: "warning",
  completed: "success",
  abandoned: "gray",
};
const TYPE_LABEL: Record<string, string> = {
  feedback: "Feedback",
  feature_request: "Feature request",
};

const When = ({ value }: { value?: string | null }) =>
  value ? <span>{new Date(value).toLocaleString()}</span> : null;

const FeedbackDetail = ({ session }: { session: IFeedbackSessionDetail | null }) => {
  const router = useRouter();
  const [busy, setBusy] = useState<"review" | "convert" | null>(null);

  if (!session) {
    return (
      <CardBox>
        <div className="py-16 text-center text-darklink">
          <Icon icon="solar:chat-square-like-linear" height={40} className="mx-auto mb-3" />
          <p>Feedback session not found.</p>
          <Link href="/dashboards/feedback" className="text-primary text-sm font-semibold mt-3 inline-block">
            ← Back to feedback
          </Link>
        </div>
      </CardBox>
    );
  }

  const reviewed = !!session.review?.reviewed_at;
  const ticketId = session.review?.converted_ticket_id;

  const toggleReviewed = async () => {
    setBusy("review");
    try {
      const res = await setFeedbackReviewed(session.uuid, !reviewed);
      if (res?.status) {
        toast.success(reviewed ? "Marked as not reviewed" : "Marked as reviewed");
        router.refresh();
      } else {
        toast.error(res?.message || "Couldn't update");
      }
    } finally {
      setBusy(null);
    }
  };

  const convert = async () => {
    setBusy("convert");
    try {
      const res = await convertFeedbackToTicket(session.uuid);
      if (res?.status) {
        toast.success("Ticket created from this session");
        router.refresh();
      } else {
        toast.error(res?.message || "Couldn't convert to a ticket");
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-30">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/dashboards/feedback" className="text-sm text-darklink">
            ← Feedback
          </Link>
          <h4 className="text-lg font-bold">{session.summary || "Feedback session"}</h4>
          <p className="text-sm text-darklink flex flex-wrap items-center gap-2">
            <Badge color="light">{session.type ? TYPE_LABEL[session.type] : "Type not set"}</Badge>
            <Badge color={STATUS_COLOR[session.status] ?? "gray"} className="capitalize">
              {session.status}
            </Badge>
            {reviewed && <Badge color="success">Reviewed</Badge>}
            {ticketId && <Badge color="info">Made a ticket</Badge>}
            · <When value={session.created_at} />
          </p>
        </div>
        <div className="flex gap-2">
          <Button color="light" onClick={toggleReviewed} disabled={busy !== null}>
            {busy === "review" && <Spinner size="sm" light />}
            <Icon icon={reviewed ? "solar:eye-closed-linear" : "solar:eye-linear"} height={16} className="me-1" />
            {reviewed ? "Unmark reviewed" : "Mark reviewed"}
          </Button>
          {ticketId ? (
            <Link href={`/dashboards/tickets?ticket=${ticketId}`}>
              <Button color="primary">
                <Icon icon="solar:ticket-linear" height={16} className="me-1" />
                Open ticket
              </Button>
            </Link>
          ) : (
            <Button color="success" onClick={convert} disabled={busy !== null}>
              {busy === "convert" && <Spinner size="sm" light />}
              <Icon icon="solar:ticket-linear" height={16} className="me-1" />
              Convert to ticket
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-30">
        <div className="col-span-12 lg:col-span-8">
          <CardBox>
            <h5 className="font-semibold mb-4">Conversation</h5>
            <div className="flex flex-col gap-3">
              {(session.messages ?? []).map((m) => (
                <div key={m.uuid} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line break-words ${
                      m.role === "user"
                        ? "bg-primary text-white rounded-br-sm"
                        : "bg-lightgray dark:bg-dark text-bodytext rounded-bl-sm"
                    }`}
                  >
                    {m.content}
                    <div className={`text-[10px] mt-1 ${m.role === "user" ? "text-white/70" : "text-darklink"}`}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
              {!session.messages?.length && (
                <p className="text-sm text-darklink">No messages in this session.</p>
              )}
            </div>
          </CardBox>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-30">
          <CardBox>
            <h5 className="font-semibold mb-3">From</h5>
            {session.user ? <Person user={session.user} /> : <p className="text-sm text-darklink">Unknown user</p>}
          </CardBox>
          {session.summary && (
            <CardBox>
              <h5 className="font-semibold mb-2">Summary</h5>
              <p className="text-sm text-darklink whitespace-pre-line">{session.summary}</p>
            </CardBox>
          )}
          <CardBox>
            <h5 className="font-semibold mb-3">Triage</h5>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-darklink">Reviewed</span>
                <span>{reviewed ? <When value={session.review?.reviewed_at} /> : "No"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-darklink">Ticket</span>
                <span>
                  {ticketId ? (
                    <Link href={`/dashboards/tickets?ticket=${ticketId}`} className="text-primary font-semibold">
                      View ticket
                    </Link>
                  ) : (
                    "Not converted"
                  )}
                </span>
              </div>
            </div>
          </CardBox>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDetail;
