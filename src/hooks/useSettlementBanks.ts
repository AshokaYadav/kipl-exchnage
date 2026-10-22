"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/axios";
import {
  addSettlementBank,
  deleteSettlementBank,
  getSettlementBanks,
  updateSettlementBank,
  type SettlementBankInput,
} from "@/services/settlement.service";

// 🏦 Mere settlement banks
export function useSettlementBanks() {
  return useQuery({ queryKey: ["settlement-banks"], queryFn: getSettlementBanks });
}

// ➕ / ✏️ id ho toh update, warna add
export function useSaveSettlementBank(onDone: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: SettlementBankInput }) =>
      id ? updateSettlementBank(id, input) : addSettlementBank(input),
    onSuccess: (_, { id }) => {
      toast.success(id ? "Bank update ho gaya ✅" : "Bank add ho gaya ✅");
      queryClient.invalidateQueries({ queryKey: ["settlement-banks"] });
      onDone();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// ⭐ Default bank badlo — sirf is_default jaata hai
export function useMakeDefaultBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => updateSettlementBank(id, { is_default: true }),
    onSuccess: () => {
      toast.success("Default bank badal gaya ✅");
      queryClient.invalidateQueries({ queryKey: ["settlement-banks"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// 🗑️ Bank delete
export function useDeleteSettlementBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSettlementBank(id),
    onSuccess: () => {
      toast.success("Bank delete ho gaya");
      queryClient.invalidateQueries({ queryKey: ["settlement-banks"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
