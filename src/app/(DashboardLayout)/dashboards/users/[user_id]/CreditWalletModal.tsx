"use client";

import { useEffect, useMemo, useState } from "react";
import { Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner, Textarea, TextInput } from "flowbite-react";
import { toast } from "sonner";
import { Button } from "@/app/components/shared/Button";
import { creditUserWallet } from "@/app/api/wallet";

type Unit = "coins" | "earnings";
const LIMITS = { coins: 1_000_000, usd: 1_000 };
const num = (n: number, digits = 2) => n.toLocaleString("en-US", { maximumFractionDigits: digits });

const CreditWalletModal = ({
  open,
  userId,
  username,
  cowryRateUsd,
  onClose,
  onDone,
}: {
  open: boolean;
  userId: string;
  username: string;
  cowryRateUsd: number;
  onClose: () => void;
  onDone: () => void;
}) => {
  const [unit, setUnit] = useState<Unit>("coins");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  // One id per credit, kept across retries so a resend never credits twice.
  const [requestId, setRequestId] = useState("");

  useEffect(() => {
    if (open) setRequestId(crypto.randomUUID());
  }, [open]);

  const value = Number(amount);
  const problem = useMemo(() => {
    if (!amount) return "Enter an amount";
    if (!Number.isFinite(value) || value <= 0) return "Enter an amount above zero";
    if (unit === "coins" && !Number.isInteger(value)) return "Coins must be a whole number";
    if (unit === "earnings" && Math.round(value * 100) !== value * 100) return "Use at most 2 decimal places";
    if (unit === "coins" && value > LIMITS.coins) return `At most ${num(LIMITS.coins)} Coins per credit`;
    if (unit === "earnings" && value > LIMITS.usd) return `At most $${num(LIMITS.usd)} per credit`;
    if (description.trim().length < 3) return "Add a description for the user";
    return null;
  }, [amount, value, unit, description]);

  const what = unit === "coins" ? `${num(value, 0)} ${value === 1 ? "Coin" : "Coins"}` : `$${value.toFixed(2)}`;
  const equivalent =
    !amount || !Number.isFinite(value) || value <= 0 || !cowryRateUsd
      ? null
      : unit === "coins"
        ? `≈ $${num(value * cowryRateUsd)}`
        : `= ${num(Math.floor((value / cowryRateUsd) * 100) / 100)} Cowries`;

  const close = () => {
    setUnit("coins");
    setAmount("");
    setDescription("");
    setNote("");
    setConfirming(false);
    onClose();
  };

  const submit = async () => {
    setBusy(true);
    try {
      const res = await creditUserWallet(userId, {
        unit,
        amount: value,
        description: description.trim(),
        staff_note: note.trim() || undefined,
        request_id: requestId,
      });
      if (res?.status) {
        toast.success(res.data?.already_credited ? "This credit was already added" : `${what} added to @${username}'s wallet`);
        onDone();
        close();
      } else {
        toast.error((Array.isArray(res?.message) ? res.message[0] : res?.message) || "Couldn't add the credit");
        setConfirming(false);
      }
    } catch {
      toast.error("Couldn't add the credit. Try again: it won't be added twice.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal show={open} onClose={busy ? () => {} : close} size="md">
      <ModalHeader>Add to wallet</ModalHeader>
      <ModalBody>
        {!confirming ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-lightgray dark:bg-dark">
              {(["coins", "earnings"] as Unit[]).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => {
                    setUnit(u);
                    setAmount("");
                  }}
                  className={`text-sm font-semibold py-2 rounded-md transition ${unit === u ? "bg-white dark:bg-darkgray shadow-sm text-ink dark:text-white" : "text-darklink"}`}
                >
                  {u === "coins" ? "Coins" : "Earnings"}
                </button>
              ))}
            </div>
            <p className="text-xs text-darklink -mt-2">
              {unit === "coins"
                ? "Spend-only: gifts and votes. Coins can't be paid out."
                : "Cashable: shown in dollars and paid out with their earnings. Paid for by the company Cowry wallet."}
            </p>

            <div>
              <Label>{unit === "coins" ? "Coins" : "Amount (US$)"}</Label>
              <TextInput
                className="mt-2"
                type="number"
                inputMode="decimal"
                min={unit === "coins" ? 1 : 0.01}
                step={unit === "coins" ? 1 : 0.01}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={unit === "coins" ? "500" : "2.50"}
              />
              {equivalent && <p className="text-[11px] text-darklink mt-1">{equivalent}</p>}
            </div>

            <div>
              <Label>Description (the user sees this)</Label>
              <TextInput
                className="mt-2"
                value={description}
                maxLength={120}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Sorry about the failed gift on 24 Nov"
              />
              <p className="text-[11px] text-darklink mt-1 text-right">{description.trim().length}/120</p>
            </div>

            <div>
              <Label>Staff note (optional, never shown to the user)</Label>
              <Textarea
                className="mt-2"
                rows={2}
                maxLength={500}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ticket number, who asked for it…"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 text-sm">
            <p>
              Add <span className="font-bold">{what}</span> to <span className="font-semibold">@{username}</span>&rsquo;s{" "}
              {unit === "coins" ? "Coins" : "earnings"}?
            </p>
            <div className="rounded-lg border border-ld p-3">
              <p className="text-[11px] text-darklink">In their wallet history</p>
              <p className="font-semibold mt-1">From VillageSquare</p>
              <p className="text-darklink">{description.trim()}</p>
            </div>
            {note.trim() && (
              <p className="text-xs text-darklink">
                Staff note: <span className="text-ink dark:text-white">{note.trim()}</span>
              </p>
            )}
            <p className="text-xs text-darklink">They&rsquo;ll get a push. This can&rsquo;t be undone from here.</p>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        {!confirming ? (
          <>
            <Button color="gray" onClick={close}>
              Cancel
            </Button>
            <Button onClick={() => (problem ? toast.error(problem) : setConfirming(true))} disabled={!!problem}>
              Continue
            </Button>
          </>
        ) : (
          <>
            <Button color="gray" onClick={() => setConfirming(false)} disabled={busy}>
              Back
            </Button>
            <Button onClick={submit} disabled={busy}>
              {busy && <Spinner size="sm" light />}
              Add {what}
            </Button>
          </>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default CreditWalletModal;
