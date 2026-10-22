"use client";

import { useEffect } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/axios";
import { createTopup, getTopupBanks, getTopups, type TopupInput } from "@/services/topup.service";

// 📋 Fund requests list — page badalte waqt purana data dikhta rahe
export function useTopups(params: { page: number; limit: number }) {
  const query = useQuery({
    queryKey: ["topups", params],
    queryFn: () => getTopups(params),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (query.isError) toast.error(getErrorMessage(query.error));
  }, [query.isError, query.error]);

  return query;
}

// 🏦 Banks list (form ke dropdown ke liye)
export function useTopupBanks() {
  return useQuery({ queryKey: ["topup-banks"], queryFn: getTopupBanks, staleTime: 5 * 60 * 1000 });
}

// ➕ Nayi fund request
export function useCreateTopup(onDone: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TopupInput) => createTopup(input),
    onSuccess: () => {
      toast.success("Fund request bhej di ✅ Admin approve karega");
      queryClient.invalidateQueries({ queryKey: ["topups"] });
      onDone();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
