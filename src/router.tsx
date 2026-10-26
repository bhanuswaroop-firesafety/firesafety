import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // Keep data fresh for 1 minute
        gcTime: 10 * 60 * 1000, // Retain in memory for 10 minutes
        refetchOnWindowFocus: false, // Prevent refetch flashes on tab switch
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent", // Preload route JS & data immediately when user hovers/focuses a link
    defaultPreloadDelay: 50,
    defaultPreloadStaleTime: 60 * 1000,
    trailingSlash: "preserve",
  });

  return router;
};
