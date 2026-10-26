"use client";

import { useEffect } from "react";
import { keepPreviousData, useQuery, type UseQueryResult } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/axios";
import {
  getBuyerDaybook,
  getBuyerLedger,
  getBuyerRecharges,
  getSellerDaybook,
  getSellerHistory,
  getSellerLedger,
  type BuyerLedgerParams,
  type BuyerRechargeParams,
  type SellerHistoryParams,
  type SellerLedgerParams,
} from "@/services/history.service";

// Error aaye toh toast
function useErrorToast(query: UseQueryResult<unknown>) {
  useEffect(() => {
    if (query.isError) toast.error(getErrorMessage(query.error));
  }, [query.isError, query.error]);
}

// 🧾 Buyer recharge history — page badalte waqt purana data dikhta rahe
export function useBuyerRecharges(params: BuyerRechargeParams) {
  const query = useQuery({
    queryKey: ["buyer-recharges", params],
    queryFn: () => getBuyerRecharges(params),
    placeholderData: keepPreviousData,
  });
  useErrorToast(query);
  return query;
}

// 📒 Buyer daybook
export function useBuyerDaybook(params: { from?: string; to?: string }) {
  const query = useQuery({
    queryKey: ["buyer-daybook", params],
    queryFn: () => getBuyerDaybook(params),
    placeholderData: keepPreviousData,
  });
  useErrorToast(query);
  return query;
}

// 📘 Seller daybook
export function useSellerDaybook(params: { from?: string; to?: string }) {
  const query = useQuery({
    queryKey: ["seller-daybook", params],
    queryFn: () => getSellerDaybook(params),
    placeholderData: keepPreviousData,
  });
  useErrorToast(query);
  return query;
}

// 💸 Seller history
export function useSellerHistory(params: SellerHistoryParams) {
  const query = useQuery({
    queryKey: ["seller-history", params],
    queryFn: () => getSellerHistory(params),
    placeholderData: keepPreviousData,
  });
  useErrorToast(query);
  return query;
}

// 📗 Seller ledger
export function useSellerLedger(params: SellerLedgerParams) {
  const query = useQuery({
    queryKey: ["seller-ledger", params],
    queryFn: () => getSellerLedger(params),
    placeholderData: keepPreviousData,
  });
  useErrorToast(query);
  return query;
}

// 📕 Buyer ledger
export function useBuyerLedger(params: BuyerLedgerParams) {
  const query = useQuery({
    queryKey: ["buyer-ledger", params],
    queryFn: () => getBuyerLedger(params),
    placeholderData: keepPreviousData,
  });
  useErrorToast(query);
  return query;
}
