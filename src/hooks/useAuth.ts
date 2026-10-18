"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/axios";
import { clearSession } from "@/lib/session";
import {
  createUser,
  extractOtpToken,
  sendOTP,
  verifyOTP,
} from "@/services/auth.service";

// 📲 OTP bhejna
export function useSendOtp(onToken: (token: string) => void) {
  return useMutation({
    mutationFn: (mobile: string) => sendOTP(mobile),
    onSuccess: (res, mobile) => {
      // 🔍 Debug: browser console (F12) mein poora response dikhega
      console.log("[login-app] response:", res);

      // Backend ne saaf mana kiya (status false) → error dikhao, screen mat badlo
      const failed = res?.status === false || res?.status === "false" || res?.success === false;
      if (failed) {
        toast.error(res?.message ?? "OTP nahi bhej paaye, dobara try karo.");
        return;
      }

      const token = extractOtpToken(res);
      if (!token) {
        // Token nahi mila par OTP chala gaya → OTP screen phir bhi kholo.
        // Fallback: mobile ko token ki jagah bhejenge; galat hua toh verify par
        // backend ka asli error dikhega.
        console.warn("[login-app] token key nahi mili, mobile fallback use ho raha hai");
      }

      toast.success(res?.message ?? "OTP bhej diya gaya ✅");
      onToken(token ?? mobile);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// ✅ OTP verify karke dashboard
export function useVerifyOtp() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ otp, token }: { otp: string; token: string }) =>
      verifyOTP(otp, token),
    onSuccess: (res) => {
      console.log("[verify-otp] response:", res);
      if (!res?.token) {
        toast.error(res?.message ?? "Galat OTP, dobara try karo.");
        return;
      }
      toast.success("Login successful 🎉");
      queryClient.invalidateQueries({ queryKey: ["me"] });
      router.replace("/dashboard");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// 🆕 Naya user banana
export function useCreateUser() {
  return useMutation({
    mutationFn: (v: { name: string; mobile: string; email: string }) =>
      createUser(v.name, v.mobile, v.email),
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// 🚪 Logout
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return () => {
    clearSession();
    queryClient.clear();
    toast.success("Logout ho gaye");
    router.replace("/login");
  };
}
