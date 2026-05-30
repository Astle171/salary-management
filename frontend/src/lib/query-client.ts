import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:          30 * 1000,   // 30s — data stays fresh
      retry:              1,            // one retry on failure
      refetchOnWindowFocus: false,      // don't refetch just by switching tabs
    },
  },
})