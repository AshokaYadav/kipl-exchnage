"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/axios";
import {
  createApiToken,
  deleteApiToken,
  deleteIp,
  getApiTokens,
  getIps,
  regenerateApiToken,
  updateApiToken,
  type ApiTokenInput,
  type IpListParams,
} from "@/services/api-access.service";

// 🔑 Tokens list
export function useApiTokens() {
  return useQuery({ queryKey: ["api-tokens"], queryFn: getApiTokens });
}

// ➕ / ✏️ id ho toh update, warna naya token
export function useSaveApiToken(onDone: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: ApiTokenInput }) => {
      if (id) await updateApiToken(id, input);
      else await createApiToken(input);
    },
    onSuccess: (_, { id }) => {
      toast.success(id ? "Token update ho gaya ✅" : "Naya token ban gaya ✅");
      queryClient.invalidateQueries({ queryKey: ["api-tokens"] });
      onDone();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// 🔁 Table se Active / Inactive
export function useToggleApiToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACTIVE" | "INACTIVE" }) => updateApiToken(id, { status }),
    onSuccess: (_, { status }) => {
      toast.success(status === "ACTIVE" ? "Token active ho gaya ✅" : "Token inactive ho gaya ✅");
      queryClient.invalidateQueries({ queryKey: ["api-tokens"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// 🔁 Token re-generate
export function useRegenerateApiToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => regenerateApiToken(id),
    onSuccess: () => {
      toast.success("Naya token generate ho gaya ✅ — purana ab kaam nahi karega");
      queryClient.invalidateQueries({ queryKey: ["api-tokens"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// 🗑️ Token delete
export function useDeleteApiToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteApiToken(id),
    onSuccess: () => {
      toast.success("Token delete ho gaya ✅");
      queryClient.invalidateQueries({ queryKey: ["api-tokens"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// 🌐 IP list
export function useIps(params: IpListParams) {
  return useQuery({
    queryKey: ["api-ips", params],
    queryFn: () => getIps(params),
    placeholderData: keepPreviousData,
  });
}

// 🗑️ IP delete
export function useDeleteIp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteIp(id),
    onSuccess: () => {
      toast.success("IP list se hat gaya ✅");
      queryClient.invalidateQueries({ queryKey: ["api-ips"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
