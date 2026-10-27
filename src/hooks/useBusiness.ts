"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/axios";
import { getBusiness, updateBusiness, type BusinessInput } from "@/services/business.service";

// 🏢 Business details
export function useBusiness() {
  return useQuery({ queryKey: ["business"], queryFn: getBusiness });
}

// ✏️ Business details save
export function useUpdateBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BusinessInput) => updateBusiness(input),
    onSuccess: () => {
      toast.success("Business details save ho gayi ✅ — verification ke liye bhej di");
      queryClient.invalidateQueries({ queryKey: ["business"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
