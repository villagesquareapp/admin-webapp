"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Modal, ModalBody, ModalFooter, ModalHeader, Textarea, Spinner } from "flowbite-react";
import { Button } from "@/app/components/shared/Button";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import { approveJoinRequest, getJoinRequestDocuments, rejectJoinRequest } from "@/app/api/trybes";
import { formatDate } from "@/utils/dateUtils";
import { Chip, KV, Person, REJECT_REASONS, label } from "../../trybeUi";

const isPdf = (url: string | null) => !!url && /\.pdf(\?|$)/i.test(url);

// Signed links go straight to S3 from the browser (no Next image proxy, so
// the photos are never cached on our servers) and stop working after 5 minutes.
const Document = ({ title, url }: { title: string; url: string | null }) => (
  <div className="flex flex-col gap-2">
    <p className="text-sm font-semibold">{title}</p>
    {!url ? (
      <div className="h-56 rounded-xl border border-dashed border-border dark:border-darkborder grid place-items-center text-sm text-darklink">
        Not provided
      </div>
    ) : isPdf(url) ? (
      <a
        href={url}
        target="_blank"
        rel="noreferrer noopener"
        className="h-56 rounded-xl border border-border dark:border-darkborder grid place-items-center text-sm text-primary font-semibold"
      >
        <span className="flex flex-col items-center gap-2">
          <Icon icon="solar:document-text-line-duotone" height={36} />
          Open PDF
        </span>
      </a>
    ) : (
      <a href={url} target="_blank" rel="noreferrer noopener">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={title}
          referrerPolicy="no-referrer"
          className="h-56 w-full rounded-xl object-contain bg-lightgray dark:bg-dark border border-border dark:border-darkborder"
        />
      </a>
    )}
  </div>
);

const JoinRequestReview = ({ request }: { request: ITrybeJoinRequestDetail | null }) => {
  const [links, setLinks] = useState<ITrybeDocumentLinks | null>(null);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  useEffect(() => {
    if (expiresAt && now >= expiresAt) {
      setLinks(null);
      setExpiresAt(null);
    }
  }, [now, expiresAt]);

  if (!request) {
    return (
      <CardBox>
        <div className="py-16 text-center text-darklink">
          <Icon icon="solar:document-medicine-linear" height={40} className="mx-auto mb-3" />
          <p>Join request not found.</p>
          <Link href="/dashboards/trybes/requests" className="text-primary text-sm font-semibold mt-3 inline-block">
            ← Back to requests
          </Link>
        </div>
      </CardBox>
    );
  }

  const a = request.answers;
  const pending = request.status === "pending";
  const secondsLeft = expiresAt ? Math.max(0, Math.round((expiresAt - now) / 1000)) : 0;

  const showDocuments = async () => {
    setLoadingDocs(true);
    try {
      const res = await getJoinRequestDocuments(request.uuid);
      if (res?.status && res.data) {
        setLinks(res.data);
        setExpiresAt(Date.now() + (res.data.expires_in - 10) * 1000);
        setNow(Date.now());
      } else {
        toast.error(res?.message || "Couldn't open the photos");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoadingDocs(false);
    }
  };

  const approve = async () => {
    setBusy(true);
    try {
      const res = await approveJoinRequest(request.uuid);
      if (res?.status) {
        toast.success(`${a.full_name} is now a member of ${request.trybe.name}`);
        setApproving(false);
      } else toast.error(res?.message || "Couldn't approve this request");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    setBusy(true);
    try {
      const res = await rejectJoinRequest(request.uuid, reason.trim());
      if (res?.status) {
        toast.success("Request rejected; the student can see your reason");
        setRejecting(false);
        setReason("");
      } else toast.error(res?.message || "Couldn't reject this request");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const warnings: string[] = [];
  const reused = request.same_matric_no.filter((r) => r.status === "pending" || r.status === "approved");
  if (reused.length) {
    warnings.push(
      `Matric number ${a.matric_no} is also on ${reused.length} other ${reused.length === 1 ? "request" : "requests"} in this Trybe.`
    );
  }
  const rejectedBefore = request.other_requests.filter((r) => r.status === "rejected").length;
  if (rejectedBefore) {
    warnings.push(`This student was rejected ${rejectedBefore} time${rejectedBefore === 1 ? "" : "s"} before.`);
  }
  if (request.user.status !== "active") {
    warnings.push(`This account is ${label(request.user.status).toLowerCase()}.`);
  }

  return (
    <div className="grid grid-cols-12 gap-30">
      <div className="col-span-12 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/dashboards/trybes/requests" className="text-sm text-darklink">
            ← Join requests
          </Link>
          <h4 className="text-lg font-bold mt-1">
            {a.full_name} → {request.trybe.name}
          </h4>
          <p className="text-sm text-darklink">
            Sent {formatDate(request.created_at)} · <Chip value={request.status} />
          </p>
        </div>
        {pending && (
          <div className="flex gap-2">
            <Button color="failure" onClick={() => setRejecting(true)}>
              Reject
            </Button>
            <Button color="primary" onClick={() => setApproving(true)}>
              Approve
            </Button>
          </div>
        )}
      </div>

      {warnings.length > 0 && (
        <div className="col-span-12">
          <div className="rounded-xl bg-lightwarning text-warningemphasis dark:text-warning p-4 text-sm flex gap-3">
            <Icon icon="solar:danger-triangle-bold" height={20} className="shrink-0" />
            <ul className="list-disc ps-4">
              {warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="col-span-12 lg:col-span-4 flex flex-col gap-30">
        <CardBox>
          <h5 className="font-semibold mb-3">Join form</h5>
          <KV name="Full name" value={a.full_name} />
          <KV
            name="Matric no"
            value={
              <span>
                {a.matric_no}
                {request.matric_check === "mismatch" && (
                  <span className="block text-xs text-warning font-normal">
                    Doesn&apos;t look like this school&apos;s{request.matric_example ? ` (e.g. ${request.matric_example})` : ""}
                  </span>
                )}
              </span>
            }
          />
          <KV
            name="Department"
            value={
              <span>
                {a.department}
                {request.department ? (
                  <span className="block text-xs text-success font-normal">
                    Matches {request.department.name}
                  </span>
                ) : (
                  <Link
                    href="/dashboards/trybes/departments?tab=unmatched"
                    className="block text-xs text-warning font-normal"
                  >
                    Not on the department list
                  </Link>
                )}
              </span>
            }
          />
          <KV name="Level" value={a.level} />
          <KV name="Agreed to the Trybe Code" value={formatDate(request.code_accepted_at)} />
        </CardBox>
        <CardBox>
          <h5 className="font-semibold mb-3">Account</h5>
          <Link href={`/dashboards/users/${request.user.uuid}`}>
            <Person user={request.user} />
          </Link>
          <div className="mt-3">
            <KV name="Email" value={request.user.email} />
            <KV name="Account status" value={label(request.user.status)} />
          </div>
        </CardBox>
        <CardBox>
          <h5 className="font-semibold mb-3">Trybe</h5>
          <KV name="Name" value={<Link href={`/dashboards/trybes/${request.trybe.uuid}`} className="text-primary">{request.trybe.name}</Link>} />
          <KV name="School" value={request.trybe.subtitle} />
        </CardBox>
        {!pending && (
          <CardBox>
            <h5 className="font-semibold mb-3">Decision</h5>
            <KV name="Status" value={<Chip value={request.status} />} />
            <KV name="By" value={request.reviewer ? `${request.reviewer.name} (${request.reviewer.kind === "staff" ? "staff" : "Trybe admin"})` : null} />
            <KV name="On" value={request.reviewed_at ? formatDate(request.reviewed_at) : null} />
            {request.rejection_reason && <KV name="Reason" value={request.rejection_reason} />}
          </CardBox>
        )}
      </div>

      <div className="col-span-12 lg:col-span-8 flex flex-col gap-30">
        <CardBox>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h5 className="font-semibold">Student ID and selfie</h5>
              <p className="text-xs text-darklink">Links last 5 minutes. Each time you open them, it is logged with your name.</p>
            </div>
            {links ? (
              <span className="text-xs text-darklink tabular-nums">Hides in {secondsLeft}s</span>
            ) : (
              <Button
                size="sm"
                color="primary"
                onClick={showDocuments}
                disabled={loadingDocs || !request.has_documents}
              >
                {loadingDocs && <Spinner size="sm" light />}
                {request.has_documents ? "Show photos" : "Photos deleted"}
              </Button>
            )}
          </div>
          {links ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Document title="ID front" url={links.id_front} />
              <Document title="ID back" url={links.id_back} />
              <Document title="Selfie" url={links.selfie} />
            </div>
          ) : (
            <p className="text-sm text-darklink">
              {request.has_documents
                ? "Compare the selfie with the ID photo, and the form with the ID."
                : `These photos were deleted${request.documents_deleted_at ? ` on ${formatDate(request.documents_deleted_at)}` : ""}.`}
            </p>
          )}
        </CardBox>

        {(request.same_matric_no.length > 0 || request.other_requests.length > 0) && (
          <CardBox>
            <h5 className="font-semibold mb-3">History</h5>
            {request.same_matric_no.map((r) => (
              <div key={r.uuid} className="flex items-center justify-between py-2 text-sm border-b border-dashed border-border dark:border-darkborder last:border-0">
                <Link href={`/dashboards/trybes/requests/${r.uuid}`} className="text-primary">
                  Same matric no: {r.user.name || r.user.username}
                </Link>
                <span className="flex items-center gap-2 text-darklink">
                  {formatDate(r.created_at)} <Chip value={r.status} />
                </span>
              </div>
            ))}
            {request.other_requests.map((r) => (
              <div key={r.uuid} className="flex items-center justify-between py-2 text-sm border-b border-dashed border-border dark:border-darkborder last:border-0">
                <Link href={`/dashboards/trybes/requests/${r.uuid}`} className="text-primary">
                  Earlier request{r.rejection_reason ? `: ${r.rejection_reason}` : ""}
                </Link>
                <span className="flex items-center gap-2 text-darklink">
                  {formatDate(r.created_at)} <Chip value={r.status} />
                </span>
              </div>
            ))}
          </CardBox>
        )}

        {request.document_views.length > 0 && (
          <CardBox>
            <h5 className="font-semibold mb-3">Who opened the photos</h5>
            {request.document_views.map((v, i) => (
              <KV
                key={`${v.viewed_at}-${i}`}
                name={`${v.viewer_name || "Unknown"} (${v.viewer_kind === "staff" ? "staff" : "Trybe admin"})`}
                value={formatDate(v.viewed_at)}
              />
            ))}
          </CardBox>
        )}
      </div>

      <Modal show={approving} onClose={() => !busy && setApproving(false)} size="md">
        <ModalHeader>Approve join request</ModalHeader>
        <ModalBody>
          <p className="text-sm">
            <span className="font-semibold">{a.full_name}</span> joins{" "}
            <span className="font-semibold">{request.trybe.name}</span> as a member and gets a notification. Their ID
            photos are kept while they are a member.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="gray" onClick={() => setApproving(false)} disabled={busy}>
            Cancel
          </Button>
          <Button color="primary" onClick={approve} disabled={busy}>
            {busy && <Spinner size="sm" light />}
            Approve
          </Button>
        </ModalFooter>
      </Modal>

      <Modal show={rejecting} onClose={() => !busy && setRejecting(false)} size="lg">
        <ModalHeader>Reject join request</ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-3">
            <p className="text-sm text-darklink">
              The student sees this reason and can apply again. Their photos are deleted after 30 days.
            </p>
            <div className="flex flex-wrap gap-2">
              {REJECT_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className="text-xs rounded-full border border-border dark:border-darkborder px-3 py-1 hover:bg-lighthover dark:hover:bg-darkmuted text-start"
                >
                  {r}
                </button>
              ))}
            </div>
            <Textarea
              rows={3}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason the student will see"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="gray" onClick={() => setRejecting(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            color="failure"
            onClick={reject}
            disabled={busy || reason.trim().length < 3}
          >
            {busy && <Spinner size="sm" light />}
            Reject
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default JoinRequestReview;
