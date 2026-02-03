import { env } from "@ocrbase/env/web";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { OCRBaseProvider } from "ocrbase/react";
import { Toaster } from "sonner";

import { Header } from "@/components/layout/header";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60,
    },
  },
});

const AppLayout = () => (
  <QueryClientProvider client={queryClient}>
    <OCRBaseProvider
      config={{
        baseUrl: env.VITE_SERVER_URL,
        credentials: "include",
      }}
    >
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-container px-4 py-8">
          <Outlet />
        </main>
      </div>
      <Toaster position="bottom-right" />
    </OCRBaseProvider>
  </QueryClientProvider>
);

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});
