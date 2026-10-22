"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/axios";
import {
  createApi,
  getApis,
  getCategories,
  getOperatorMappings,
  updateApi,
  updateOperatorMappings,
  type OperatorMappingInput,
  type ProviderApiInput,
} from "@/services/apis.service";

// 📋 APIs list
export function useApis() {
  return useQuery({ queryKey: ["apis"], queryFn: getApis });
}

// ➕ / ✏️ id ho toh update, warna create
export function useSaveApi(onDone: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: ProviderApiInput }) => {
      if (id) await updateApi(id, input);
      else await createApi(input);
    },
    onSuccess: (_, { id }) => {
      toast.success(id ? "API update ho gayi ✅" : "Nayi API ban gayi ✅");
      queryClient.invalidateQueries({ queryKey: ["apis"] });
      onDone();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// 🔁 Table se Active / Inactive — edit wali API par sirf status jaata hai
export function useToggleApiStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: number }) => updateApi(id, { status }),
    onSuccess: (_, { status }) => {
      toast.success(status ? "API active ho gayi ✅" : "API inactive ho gayi ✅");
      queryClient.invalidateQueries({ queryKey: ["apis"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// 🗂️ Categories (mapping modal ke dropdown ke liye)
export function useCategories() {
  return useQuery({ queryKey: ["categories"], queryFn: getCategories, retry: 1 });
}

// 🔗 Operator mapping list — dono id hone par hi call hogi
export function useOperatorMappings(apiId: string, categoryId: string) {
  return useQuery({
    queryKey: ["operator-mappings", apiId, categoryId],
    queryFn: () => getOperatorMappings(apiId, categoryId),
    enabled: Boolean(apiId && categoryId),
  });
}

// 💾 Operator mapping save (ek row ya saari).
// Refetch nahi karte — warna doosri rows ke unsaved edits mit jaayenge.
export function useSaveOperatorMappings(apiId: string) {
  return useMutation({
    mutationFn: (mappings: OperatorMappingInput[]) =>
      updateOperatorMappings(apiId, mappings),
    onSuccess: (_, mappings) => {
      toast.success(
        mappings.length === 1
          ? "Operator mapping update ho gayi ✅"
          : `${mappings.length} mappings save ho gayi ✅`
      );
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
