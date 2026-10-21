"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, Spinner } from "flowbite-react";
import { Button } from "@/app/components/shared/Button";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import ResolveReportModal, { ReportAction } from "@/app/components/shared/ResolveReportModal";
import { getReportScreenshots } from "@/app/api/report";
import { PostOriginals, PrivatePicture, usePrivateLinks } from "@/app/components/shared/PrivateFiles";
import { Person, TrybeAvatar } from "../../trybes/trybeUi";

const STATUS_COLOR: Record<string, string> = {
  open: "warning",
  in_review: "info",
  resolved: "success",
  dismissed: "gray",
};

const Screenshots = ({ report }: { report: IReportDetail }) => {
  const links = usePrivateLinks(() => getReportScreenshots(report.id));
  if (!report.attachments_count) return null;
  return (
    <CardBox>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h5 className="font-semibold">Reporter&apos;s screenshots ({report.attachments_count})</h5>
        {links.data ? (
          <span className="text-xs text-darklink">Links expire in {links.secondsLeft}s</span>
        ) : (
          <Button size="xs" color="light" onClick={links.open} disabled={links.loading}>
            {links.loading && <Spinner size="sm" light />}
            <Icon icon="solar:eye-linear" height={16} className="me-1" />
            Show screenshots
          </Button>
        )}
      </div>
      {links.data ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {links.data.links.map((url, i) => (
            <PrivatePicture key={i} url={url} label={`Screenshot ${i + 1}`} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-darklink">Opening them is logged against your account.</p>
      )}
    </CardBox>
  );
};

const When = ({ value }: { value?: string | null }) =>
  value ? <span>{new Date(value).toLocaleString()}</span> : null;

const Target = ({ target }: { target: IReportTarget | null }) => {
  if (!target) {
    return <p className="text-sm text-darklink">The reported item can&apos;t be loaded (it may have been deleted).</p>;
  }
  const removed = !!target.deleted_at;
  const heading = target.caption ?? target.title ?? target.name ?? target.username ?? target.uuid;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge color="gray" className="capitalize">{target.kind}</Badge>
        {target.status && <Badge color="light" className="capitalize">{target.status}</Badge>}
        {removed && <Badge color="failure">Deleted</Badge>}
        {target.is_duplicate && <Badge color="warning">Limited</Badge>}
        {target.is_anonymous && <Badge color="purple">Anonymous in the app</Badge>}
        {target.category && <Badge color="info">{target.category}</Badge>}
        {target.parent_post_id && <Badge color="gray">Reply</Badge>}
      </div>

      {target.kind === "trybe" ? (
        <div className="flex items-center gap-3">
          <TrybeAvatar src={target.avatar} name={target.name ?? "Trybe"} size={48} />
          <div>
            <Link href={`/dashboards/trybes/${target.uuid}`} className="font-semibold text-primary">
              {target.name}
            </Link>
            <p className="text-sm text-darklink">
              {target.subtitle ? `${target.subtitle} · ` : ""}
              {Number(target.member_count ?? 0).toLocaleString()} members
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm whitespace-pre-line break-words">{heading}</p>
      )}

      {target.media && target.media.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {target.media.map((m) => (
            <a key={m.uuid} href={m.url ?? "#"} target="_blank" rel="noreferrer noopener">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.thumbnail || m.url || ""}
                alt={m.media_type}
                className="size-24 rounded-lg object-cover bg-lightgray dark:bg-dark"
              />
            </a>
          ))}
        </div>
      )}

      {target.author && (
        <div>
          <p className="text-xs text-darklink mb-1">
            {target.is_anonymous ? "Real author (hidden in the app)" : "Author"}
          </p>
          <Person user={target.author} />
        </div>
      )}
      {target.kind === "trybe" && !!target.admins?.length && (
        <div>
          <p className="text-xs text-darklink mb-1">Admins</p>
          <div className="flex flex-wrap gap-4">
            {target.admins.map((a) => (
              <Person key={a.uuid} user={a} />
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-darklink">
        {target.created_at && (
          <>
            Created <When value={target.created_at} />
          </>
        )}
        {removed && (
          <>
            {" "}· deleted <When value={target.deleted_at} />
          </>
        )}
      </p>

      {target.kind === "post" && (
        <Link href={`/dashboards/posts/${target.uuid}`} className="text-sm text-primary font-semibold">
          Open the post page →
        </Link>
      )}
      {target.kind === "post" && target.media?.some((m) => m.has_private_original) && <PostOriginals postId={target.uuid} />}
      {target.kind === "marketsquare" && (
        <Link href={`/dashboards/markets/products/${target.uuid}`} className="text-sm text-primary font-semibold">
          Open the product page →
        </Link>
      )}
    </div>
  );
};

const ReportDetail = ({ report }: { report: IReportDetail | null }) => {
  const router = useRouter();
  const [action, setAction] = useState<ReportAction | null>(null);

  if (!report) {
    return (
      <CardBox>
        <div className="py-16 text-center text-darklink">
          <Icon icon="solar:flag-linear" height={40} className="mx-auto mb-3" />
          <p>Report not found.</p>
          <Link href="/dashboards/reports" className="text-primary text-sm font-semibold mt-3 inline-block">
            ← Back to reports
          </Link>
        </div>
      </CardBox>
    );
  }

  const open = report.status === "open" || report.status === "in_review";
  const details = report.action_details as Record<string, any> | null | undefined;

  return (
    <div className="flex flex-col gap-30">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/dashboards/reports" className="text-sm text-darklink">
            ← Reports
          </Link>
          <h4 className="text-lg font-bold">{report.reason_ref?.title || "Report"}</h4>
          <p className="text-sm text-darklink flex flex-wrap items-center gap-2">
            <span className="capitalize">{report.report_service_type}</span> ·
            <When value={report.created_at} />
            <Badge color={STATUS_COLOR[report.status ?? "open"] ?? "gray"} className="capitalize">
              {(report.status ?? "open").replace(/_/g, " ")}
            </Badge>
          </p>
        </div>
        {open && (
          <div className="flex gap-2">
            <Button color="success" onClick={() => setAction("resolve")}>
              Resolve
            </Button>
            <Button color="light" onClick={() => setAction("dismiss")}>
              Dismiss
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-12 gap-30">
        <div className="col-span-12 lg:col-span-7">
          <CardBox>
            <h5 className="font-semibold mb-3">Reported {report.report_service_type}</h5>
            <Target target={report.target} />
          </CardBox>
        </div>
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-30">
          <CardBox>
            <h5 className="font-semibold mb-3">The report</h5>
            <div className="flex flex-col gap-3 text-sm">
              {report.reporter && (
                <div>
                  <p className="text-xs text-darklink mb-1">Reported by</p>
                  <Person user={report.reporter} />
                </div>
              )}
              {report.reason_ref?.description && <p className="text-darklink">{report.reason_ref.description}</p>}
              {report.reason && (
                <div>
                  <p className="text-xs text-darklink mb-1">Their words</p>
                  <p className="whitespace-pre-line">{report.reason}</p>
                </div>
              )}
              {report.trybe && (
                <div>
                  <p className="text-xs text-darklink mb-1">In the Trybe</p>
                  <Link href={`/dashboards/trybes/${report.trybe.uuid}`} className="flex items-center gap-2 text-primary font-semibold">
                    <TrybeAvatar src={report.trybe.avatar} name={report.trybe.name} size={28} />
                    {report.trybe.name}
                    <Badge color="light" className="capitalize">
                      {report.trybe.status}
                    </Badge>
                  </Link>
                </div>
              )}
              {details && !open && (
                <div>
                  <p className="text-xs text-darklink mb-1">Outcome</p>
                  <p>{details.resolved_reason || details.dismissed_reason || "--"}</p>
                  {Array.isArray(details.resolution_methods) && details.resolution_methods.length > 0 && (
                    <p className="text-xs text-darklink">{details.resolution_methods.join(", ")}</p>
                  )}
                </div>
              )}
            </div>
          </CardBox>
          <Screenshots report={report} />
        </div>
      </div>

      <ResolveReportModal
        reportId={action ? report.id : null}
        action={action ?? "resolve"}
        onClose={() => setAction(null)}
        onDone={() => router.refresh()}
      />
    </div>
  );
};

export default ReportDetail;
