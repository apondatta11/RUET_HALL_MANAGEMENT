// src/lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      // if u want custom staletime for a specific query, pass it in the useQuery options:
      // useQuery({ queryKey: ['myData'], queryFn: fetchMyData, staleTime: 2 * 60 * 1000 })
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: false,
    },
  },
});