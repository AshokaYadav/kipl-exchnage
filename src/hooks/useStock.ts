"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/axios";
import {
  createStock,
  deleteStock,
  getStock,
  updateStock,
  type StockInput,
  type StockUpdateInput,
} from "@/services/stock.service";

// 📦 Stock list
export function useStock() {
  return useQuery({ queryKey: ["stock"], queryFn: getStock });
}

// ➕ Naya stock
export function useCreateStock(onDone: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StockInput) => createStock(input),
    onSuccess: () => {
      toast.success("Naya stock add ho gaya ✅");
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      onDone();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// ✏️ Stock update
export function useUpdateStock(onDone: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: StockUpdateInput }) => updateStock(id, input),
    onSuccess: () => {
      toast.success("Stock update ho gaya ✅");
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      onDone();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// 🗑️ Stock delete
export function useDeleteStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStock(id),
    onSuccess: () => {
      toast.success("Stock delete ho gaya 🗑️");
      queryClient.invalidateQueries({ queryKey: ["stock"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
