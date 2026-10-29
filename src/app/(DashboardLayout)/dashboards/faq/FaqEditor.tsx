"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, ModalBody, Select, Spinner, Textarea, TextInput } from "flowbite-react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import ReasonModal from "@/app/components/shared/ReasonModal";
import { Button } from "@/app/components/shared/Button";
import { addFaq, addFaqCategory, deleteFaq, deleteFaqCategory, renameFaqCategory, updateFaq } from "@/app/api/faq";
import SuiteHeader from "../business-suite/SuiteHeader";

type Draft = { id?: number; category_id: number; question: string; answer: string };

const QuestionModal = ({
  draft,
  categories,
  onClose,
}: {
  draft: Draft | null;
  categories: IFaqCategory[];
  onClose: () => void;
}) => {
  const router = useRouter();
  // Keyed by the draft, so each open starts from it.
  const [f, setForm] = useState<Draft | null>(draft);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!f) return;
    if (!f.question.trim() || !f.answer.trim()) return toast.error("Add both the question and its answer");
    setBusy(true);
    const res = f.id
      ? await updateFaq(f.id, { category_id: f.category_id, question: f.question, answer: f.answer })
      : await addFaq({ category_id: f.category_id, question: f.question, answer: f.answer });
    setBusy(false);
    if (!res?.status) return toast.error(res?.message || "That didn’t save");
    toast.success(f.id ? "Question updated" : "Question added");
    onClose();
    router.refresh();
  };

  return (
    <Modal show={!!draft} size="2xl" onClose={() => !busy && onClose()} popup>
      <ModalBody>
        {f && (
          <div className="pt-6 flex flex-col gap-4">
            <h3 className="text-lg font-semibold">{f.id ? "Edit question" : "New question"}</h3>
            <div>
              <p className="text-xs font-medium text-darklink mb-1.5">Section</p>
              <Select value={f.category_id} onChange={(e) => setForm({ ...f, category_id: Number(e.target.value) })} disabled={busy}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <p className="text-xs font-medium text-darklink mb-1.5">Question</p>
              <TextInput value={f.question} maxLength={500} onChange={(e) => setForm({ ...f, question: e.target.value })} disabled={busy} placeholder="How do I…?" />
            </div>
            <div>
              <p className="text-xs font-medium text-darklink mb-1.5">Answer</p>
              <Textarea rows={7} value={f.answer} maxLength={5000} onChange={(e) => setForm({ ...f, answer: e.target.value })} disabled={busy} placeholder="Write it the way you’d explain it to a friend." />
              <p className="text-right text-[11px] text-darklink mt-1">{f.answer.length}/5000</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button color="light" onClick={onClose} disabled={busy}>Cancel</Button>
              <Button color="primary" onClick={save} disabled={busy}>
                {busy && <Spinner size="sm" light />}
                {f.id ? "Save changes" : "Add question"}
              </Button>
            </div>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};

const SectionName = ({ category }: { category: IFaqCategory }) => {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);

  const save = async () => {
    if (!name.trim() || name.trim() === category.name) return setEditing(false);
    const res = await renameFaqCategory(category.id, name.trim());
    if (!res?.status) return toast.error(res?.message || "That didn’t save");
    toast.success("Section renamed");
    setEditing(false);
    router.refresh();
  };

  return editing ? (
    <form onSubmit={(e) => { e.preventDefault(); save(); }} className="flex items-center gap-2">
      <TextInput sizing="sm" value={name} maxLength={100} autoFocus onChange={(e) => setName(e.target.value)} />
      <Button size="xs" color="primary" type="submit">Save</Button>
      <Button size="xs" color="light" onClick={() => { setName(category.name); setEditing(false); }}>Cancel</Button>
    </form>
  ) : (
    <button onClick={() => setEditing(true)} className="group flex items-center gap-2 text-left">
      <h5 className="text-base font-semibold">{category.name}</h5>
      <Icon icon="solar:pen-linear" height={15} className="text-darklink opacity-0 group-hover:opacity-100" />
    </button>
  );
};

const FaqEditor = ({ data }: { data: IFaqList | null }) => {
  const router = useRouter();
  const categories = data?.categories ?? [];
  const [draft, setDraft] = useState<Draft | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [removing, setRemoving] = useState<{ kind: "faq" | "section"; id: number; label: string } | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const addSection = async () => {
    if (!newName.trim()) return;
    const res = await addFaqCategory(newName.trim());
    if (!res?.status) return toast.error(res?.message || "That didn’t save");
    toast.success("Section added");
    setNewName("");
    setAdding(false);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-5">
      <SuiteHeader
        title="Help & FAQ"
        subtitle={`What people see under Help in the app${data ? ` · ${categories.length} sections, ${data.total_questions} questions` : ""}`}
        back="/dashboards/business-suite"
        actions={
          <>
            <Button color="light" className="h-10" onClick={() => setAdding(true)}>
              <Icon icon="solar:folder-add-linear" height={17} className="me-1" /> Add section
            </Button>
            <Button
              color="primary"
              className="h-10"
              disabled={!categories.length}
              onClick={() => setDraft({ category_id: categories[0]?.id, question: "", answer: "" })}
            >
              <Icon icon="solar:add-circle-bold" height={18} className="me-1" /> Add question
            </Button>
          </>
        }
      />

      {adding && (
        <CardBox>
          <form onSubmit={(e) => { e.preventDefault(); addSection(); }} className="flex flex-col sm:flex-row gap-2">
            <TextInput className="flex-1" value={newName} maxLength={100} autoFocus placeholder="Section name, e.g. Payments" onChange={(e) => setNewName(e.target.value)} />
            <Button type="submit" color="primary" className="h-10">Add section</Button>
            <Button color="light" className="h-10" onClick={() => setAdding(false)}>Cancel</Button>
          </form>
        </CardBox>
      )}

      {!categories.length && !adding && (
        <CardBox>
          <div className="py-14 text-center">
            <span className="mx-auto size-14 rounded-full grid place-items-center bg-lightprimary text-primary">
              <Icon icon="solar:question-circle-bold-duotone" height={28} />
            </span>
            <p className="text-base font-semibold mt-3">No FAQ yet</p>
            <p className="text-sm text-darklink mt-1">Add a section, then the questions people ask most.</p>
          </div>
        </CardBox>
      )}

      {categories.map((c) => (
        <CardBox key={c.id}>
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <div className="flex items-center gap-3">
              <SectionName category={c} />
              <span className="text-xs text-darklink">{c.faqs.length} {c.faqs.length === 1 ? "question" : "questions"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button size="xs" color="light" onClick={() => setDraft({ category_id: c.id, question: "", answer: "" })}>
                <Icon icon="solar:add-circle-linear" height={15} className="me-1" /> Question
              </Button>
              <button
                onClick={() => setRemoving({ kind: "section", id: c.id, label: c.name })}
                className="p-2 rounded-full text-darklink hover:text-error hover:bg-lighterror"
                aria-label={`Delete ${c.name}`}
              >
                <Icon icon="solar:trash-bin-trash-linear" height={17} />
              </button>
            </div>
          </div>
          {c.faqs.length ? (
            <div className="flex flex-col divide-y divide-border dark:divide-darkborder border border-ld rounded-xl">
              {c.faqs.map((q) => {
                const expanded = open === q.id;
                return (
                  <div key={q.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <button className="flex items-start gap-2 text-left flex-1 min-w-0" onClick={() => setOpen(expanded ? null : q.id)}>
                        <Icon icon={expanded ? "solar:alt-arrow-down-linear" : "solar:alt-arrow-right-linear"} height={16} className="text-darklink mt-0.5 shrink-0" />
                        <span className="text-sm font-medium">{q.question}</span>
                      </button>
                      <div className="flex items-center shrink-0">
                        <button onClick={() => setDraft({ id: q.id, category_id: q.category_id, question: q.question, answer: q.answer })} className="p-1.5 rounded-full text-darklink hover:text-primary hover:bg-lightprimary" aria-label="Edit">
                          <Icon icon="solar:pen-linear" height={16} />
                        </button>
                        <button onClick={() => setRemoving({ kind: "faq", id: q.id, label: q.question })} className="p-1.5 rounded-full text-darklink hover:text-error hover:bg-lighterror" aria-label="Delete">
                          <Icon icon="solar:trash-bin-trash-linear" height={16} />
                        </button>
                      </div>
                    </div>
                    {expanded && <p className="text-sm text-darklink whitespace-pre-line mt-2 ms-6">{q.answer}</p>}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-darklink py-3">No questions in this section yet.</p>
          )}
        </CardBox>
      ))}

      <QuestionModal key={draft ? `${draft.id ?? "new"}-${draft.category_id}` : "closed"} draft={draft} categories={categories} onClose={() => setDraft(null)} />
      <ReasonModal
        open={!!removing}
        needsReason={false}
        title={removing?.kind === "section" ? "Delete this section?" : "Delete this question?"}
        text={removing?.kind === "section" ? "Its questions go with it, and it disappears from the app." : "It disappears from the app."}
        subject={removing?.label}
        confirmLabel="Delete"
        icon="solar:trash-bin-trash-bold-duotone"
        onClose={() => setRemoving(null)}
        onConfirm={async () => {
          if (!removing) return;
          const res = removing.kind === "section" ? await deleteFaqCategory(removing.id) : await deleteFaq(removing.id);
          if (!res?.status) {
            toast.error(res?.message || "That didn’t delete");
            return false;
          }
          toast.success(removing.kind === "section" ? "Section deleted" : "Question deleted");
          router.refresh();
        }}
      />
    </div>
  );
};

export default FaqEditor;
