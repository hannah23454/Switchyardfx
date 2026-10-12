import { useQuery } from "@tanstack/react-query";
import { switchyardService } from "@/services/switchyard";

// The home-page FX ticker board: one cache entry, refreshed every minute (the server keeps a
// quota-aware snapshot, so polling is cheap even on the free Twelve Data plan).
export function useMarketTicker() {
  return useQuery({ queryKey: ["market-ticker"], queryFn: switchyardService.getMarketTicker, retry: false, staleTime: 60_000, refetchInterval: 60_000 });
}