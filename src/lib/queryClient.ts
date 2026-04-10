// src/lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

// WHY A SEPARATE FILE?
// QueryClient holds your entire cache. We create it once
// here and share it across the whole app via QueryProvider.
// If you created it inside the component, it'd be
// recreated on every render — destroying your cache.

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime — how long data is considered "fresh"
      // During this window, TanStack won't refetch even if
      // you re-mount the component or switch tabs.
      // 5 minutes is a good default for most data.
      staleTime: 5 * 60 * 1000,
      // if u want custom staletime for a specific query, pass it in the useQuery options:
      // useQuery({ queryKey: ['myData'], queryFn: fetchMyData, staleTime: 2 * 60 * 1000 })

      // gcTime — how long unused cache entries are kept
      // in memory before being garbage collected.
      // 10 minutes means if you navigate away and come back
      // within 10 min, the data is still there instantly.
      gcTime: 10 * 60 * 1000,

      // How many times to retry a failed request
      // before giving up and showing an error.
      // 1 retry is enough — if it failed twice, it's
      // probably not a transient network blip.
      retry: 1,

      // Refetch when user switches back to your tab
      // Great for stock status — if a pharmacist updated
      // inventory while user was on another tab,
      // they'll see the fresh data immediately on return.
      refetchOnWindowFocus: true,
    },
    mutations: {
      // Don't retry mutations (POST/PATCH/DELETE)
      // A failed "place order" shouldn't auto-retry —
      // you might end up placing the order twice.
      retry: false,
    },
  },
});