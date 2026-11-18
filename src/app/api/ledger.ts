"use server";

import { apiGet, apiPatch, apiPost } from "@/lib/api";
import { getToken } from "@/lib/getToken";
import { revalidateCurrentPath } from "@/lib/revalidate";

const query = (params: Record<string, string | number | undefined>) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v !== undefined && v !== "" && q.set(k, String(v)));
  return q.toString();
};

export const getLedgerOverview = async () => {
  const token = await getToken();
  return await apiGet<ILedgerOverview>(`admin/ledger/overview`, token);
};

export const getLedgerAccounts = async (filters: {
  page?: number;
  per_page?: number;
  search?: string;
  account_type?: string;
  currency_type?: string;
  status?: string;
  owner_type?: string;
}) => {
  const token = await getToken();
  return await apiGet<ILedgerPage<ILedgerAccount>>(`admin/ledger/accounts?${query(filters)}`, token);
};

export const getLedgerAccount = async (accountId: string) => {
  const token = await getToken();
  return await apiGet<ILedgerAccountDetail>(`admin/ledger/accounts/${accountId}`, token);
};

export const getLedgerTransactions = async (filters: {
  page?: number;
  per_page?: number;
  account_id?: string;
  transaction_type?: string;
  category?: string;
  status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}) => {
  const token = await getToken();
  return await apiGet<ILedgerPage<ILedgerTransaction>>(`admin/ledger/transactions?${query(filters)}`, token);
};

export const setLedgerAccountStatus = async (accountId: string, status: string, reason: string) => {
  const token = await getToken();
  const r = await apiPatch(`admin/ledger/accounts/${accountId}/status`, { status, reason }, token);
  if (r.status) await revalidateCurrentPath();
  return r;
};

export const reverseLedgerTransaction = async (transactionId: string, reason: string) => {
  const token = await getToken();
  const r = await apiPost(`admin/ledger/reverse/${transactionId}`, { reason }, token);
  if (r.status) await revalidateCurrentPath();
  return r;
};

export const reconcileLedger = async (from: string, to: string) => {
  const token = await getToken();
  return await apiPost<ILedgerReconciliation>(`admin/ledger/reconcile`, { from, to }, token);
};

// Stored balances the nightly check found wrong. status: open, resolved or all.
export const getLedgerBalanceChecks = async (status: "open" | "resolved" | "all" = "open") => {
  const token = await getToken();
  return await apiGet<ILedgerBalanceMismatch[]>(`admin/ledger/balance-checks?status=${status}`, token);
};

// Sets the stored balance from the entries; optionally unfreezes the account.
export const rebuildLedgerBalance = async (accountId: string, reason: string, unfreeze: boolean) => {
  const token = await getToken();
  const r = await apiPost<ILedgerRebuildResult>(
    `admin/ledger/accounts/${accountId}/rebuild-balance`,
    { reason, unfreeze },
    token
  );
  if (r.status) await revalidateCurrentPath();
  return r;
};
