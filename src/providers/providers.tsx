"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { ReactNode } from "react";
import { AuthProvider } from "./auth-provider";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Analytics />
        {children}
      </QueryClientProvider>
    </AuthProvider>
  );
}
