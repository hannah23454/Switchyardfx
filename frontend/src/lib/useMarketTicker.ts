import { useQuery } from "@tanstack/react-query";
import { switchyardService } from "@/services/switchyard";

// The home-page FX ticker board: one cache entry, polled at the server's refresh_seconds clamped
// to 15–60s (the server keeps a quota-aware snapshot, so polling is cheap even on the free Twelve
// Data plan, and a paid plan with a short TTL gets prices as fast as the server refreshes them).
function pollMs(refreshSeconds: number | undefined): number {
  return Math.min(60, Math.max(15, refreshSeconds ?? 60)) * 1000;
}

export function useMarketTicker() {
  return useQuery({
    queryKey: ["market-ticker"],
    queryFn: switchyardService.getMarketTicker,
    retry: false,
    staleTime: 15_000,
    refetchInterval: (query) => pollMs(query.state.data?.refresh_seconds),
  });
}
