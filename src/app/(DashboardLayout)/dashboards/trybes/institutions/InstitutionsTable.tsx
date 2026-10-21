"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@/utils/table";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { Button } from "@/app/components/shared/Button";
import ReusableTable from "@/app/components/shared/ReusableTable";
import KpiCard from "@/app/components/shared/KpiCard";
import PostSearch from "../../posts/PostSearch";
import { Chip } from "../trybeUi";
import { FilterBar, INSTITUTION_KINDS, InstitutionLogo, NIGERIAN_STATES, OWNERSHIP, kindLabel } from "../campusUi";
import InstitutionForm from "./InstitutionForm";

const InstitutionsTable = ({
  rows,
  summary,
  total,
  totalPages,
  currentPage,
  pageSize,
}: {
  rows: IInstitution[];
  summary: IInstitutionSummary | null;
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const col = createColumnHelper<IInstitution>();

  const columns = [
    col.accessor("name", {
      header: () => <span>Institution</span>,
      cell: (info) => {
        const i = info.row.original;
        return (
          <div className="flex items-center gap-3 min-w-0">
            <InstitutionLogo src={i.logo} size={36} />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate max-w-[300px]">{i.name}</p>
              <p className="text-xs text-darklink truncate max-w-[300px]">
                {[i.short_name, i.city].filter(Boolean).join(" · ") || "—"}
              </p>
            </div>
          </div>
        );
      },
    }),
    col.accessor("kind", {
      header: () => <span>Kind</span>,
      cell: (i) => <span className="text-sm whitespace-nowrap">{kindLabel(i.getValue())}</span>,
    }),
    col.accessor("state", {
      header: () => <span>State</span>,
      cell: (i) => <span className="text-sm">{i.getValue() || "—"}</span>,
    }),
    col.accessor("ownership", {
      header: () => <span>Ownership</span>,
      cell: (i) => <span className="text-sm">{i.getValue() ? OWNERSHIP.find((o) => o.value === i.getValue())?.label : "—"}</span>,
    }),
    col.accessor((r) => r.trybe?.name, {
      id: "trybe",
      header: () => <span>Trybe</span>,
      cell: (info) => {
        const i = info.row.original;
        return i.trybe ? (
          <Link
            href={`/dashboards/trybes/${i.trybe.uuid}`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-primary font-medium"
          >
            {i.trybe.name}
            <span className="text-xs text-darklink font-normal">
              {" "}
              · {Number(i.trybe.member_count).toLocaleString()} members
              {i.pending_requests ? ` · ${i.pending_requests} waiting` : ""}
            </span>
          </Link>
        ) : (
          <span className="text-sm text-darklink">No Trybe yet</span>
        );
      },
    }),
    col.accessor("is_active", {
      header: () => <span>Status</span>,
      cell: (i) => (i.getValue() ? <Chip value="active" /> : <Chip value="disabled" />),
    }),
  ];

  const kinds = summary?.by_kind ?? [];
  return (
    <>
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <KpiCard icon="solar:buildings-2-line-duotone" value={summary.total} label="Institutions" tone="bg-lightprimary text-primary" />
          <KpiCard icon="solar:users-group-two-rounded-line-duotone" value={summary.linked} label="With a Trybe" tone="bg-lightsuccess text-success" />
          {kinds
            .filter((k) => k.total > 0 && k.kind !== "other")
            .map((k) => (
              <KpiCard
                key={k.kind}
                icon="solar:square-academic-cap-line-duotone"
                value={k.total}
                label={`${kindLabel(k.kind)}${k.linked ? ` · ${k.linked} linked` : ""}`}
                tone="bg-lightinfo text-info"
              />
            ))}
        </div>
      )}
      <FilterBar
        filters={[
          {
            key: "kind",
            options: [{ value: "", label: "Any kind" }, ...INSTITUTION_KINDS.map((k) => ({ value: k.value, label: k.label }))],
          },
          {
            key: "state",
            options: [{ value: "", label: "Any state" }, ...NIGERIAN_STATES.map((s) => ({ value: s, label: s }))],
          },
          {
            key: "ownership",
            options: [{ value: "", label: "Any ownership" }, ...OWNERSHIP],
          },
          {
            key: "linked",
            options: [
              { value: "", label: "With or without a Trybe" },
              { value: "true", label: "Has a Trybe" },
              { value: "false", label: "No Trybe yet" },
            ],
          },
          {
            key: "active",
            options: [
              { value: "", label: "Active or disabled" },
              { value: "true", label: "Active" },
              { value: "false", label: "Disabled" },
            ],
          },
          {
            key: "sort",
            options: [
              { value: "", label: "A–Z" },
              { value: "members", label: "Biggest Trybe first" },
              { value: "recent", label: "Recently added" },
            ],
          },
        ]}
      />
      <ReusableTable
        tableData={rows}
        columns={columns}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
        dense
        compactTitle
        tableTitle={`${total.toLocaleString()} institutions`}
        extraButtons={
          <div className="flex gap-2">
            <PostSearch placeholder="Name, short name or town..." />
            <Button color="primary" onClick={() => setAdding(true)}>
              Add institution
            </Button>
          </div>
        }
        onRowClick={(row: IInstitution) => router.push(`/dashboards/trybes/institutions/${row.uuid}`)}
      />

      <Modal show={adding} onClose={() => setAdding(false)} size="3xl">
        <ModalHeader>Add an institution</ModalHeader>
        <ModalBody>
          {adding && (
            <InstitutionForm
              onSaved={(saved) => {
                setAdding(false);
                router.push(`/dashboards/trybes/institutions/${saved.uuid}`);
              }}
            />
          )}
        </ModalBody>
      </Modal>
    </>
  );
};

export default InstitutionsTable;
