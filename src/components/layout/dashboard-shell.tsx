"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { TopbarLayout } from "@/components/layout/topbar-layout";
import { useRequireAuth } from "@/hooks/useSession";
import { LayoutProvider, useLayoutMode } from "@/providers/layout-provider";

function Inner({ children }: { children: ReactNode }) {
  const { ready, user } = useRequireAuth();
  const { mode } = useLayoutMode();

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="size-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return mode === "sidebar" ? (
    <SidebarLayout user={user}>{children}</SidebarLayout>
  ) : (
    <TopbarLayout user={user}>{children}</TopbarLayout>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <LayoutProvider>
      <Inner>{children}</Inner>
    </LayoutProvider>
  );
}
