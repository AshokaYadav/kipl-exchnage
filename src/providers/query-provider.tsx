"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { useTheme } from "@/providers/theme-provider";

export function QueryProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster richColors position="top-center" theme={theme} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
