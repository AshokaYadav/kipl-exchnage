"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, getUser, type AppUser } from "@/lib/session";

// Login hai toh login/register page se dashboard bhej do
export function useRedirectIfLoggedIn() {
  const router = useRouter();
  useEffect(() => {
    if (getToken()) router.replace("/dashboard");
  }, [router]);
}

// Dashboard guard: token nahi toh /login
export function useRequireAuth() {
  const router = useRouter();
  const [state, setState] = useState<{ ready: boolean; user: AppUser | null }>({
    ready: false,
    user: null,
  });

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setState({ ready: true, user: getUser() });
  }, [router]);

  return state;
}
