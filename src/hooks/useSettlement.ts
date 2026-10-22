"use client";

import { useEffect } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/axios";
import {
  cancelSettlement,
  createSettlement,
  getSettlements,
  type SettlementInput,
  type SettlementParams,
} from "@/services/settlement.service";

// 📋 Settlement requests — page badalte waqt purana data dikhta rahe
export function useSettlements(params: SettlementParams) {
  const query = useQuery({
    queryKey: ["settlements", params],
    queryFn: () => getSettlements(params),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (query.isError) toast.error(getErrorMessage(query.error));
  }, [query.isError, query.error]);

  return query;
}

// ➕ Nayi settlement request
export function useCreateSettlement(onDone: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SettlementInput) => createSettlement(input),
    onSuccess: () => {
      toast.success("Settlement request bhej di ✅ Admin process karega");
      queryClient.invalidateQueries({ queryKey: ["settlements"] });
      onDone();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// ✖️ Pending request cancel
export function useCancelSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelSettlement(id),
    onSuccess: () => {
      toast.success("Settlement request cancel ho gayi");
      queryClient.invalidateQueries({ queryKey: ["settlements"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
