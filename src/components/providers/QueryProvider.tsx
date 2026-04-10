// src/components/providers/QueryProvider.tsx
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/queryClient";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools — only renders in development */}
      {/* Opens a panel showing all queries, their cache */}
      {/* status, data, and when they last fetched */}
      {/* Invaluable for debugging — you'll use this constantly */}
      <ReactQueryDevtools
        initialIsOpen={false}
        buttonPosition="bottom-left"
      />
    </QueryClientProvider>
  );
}