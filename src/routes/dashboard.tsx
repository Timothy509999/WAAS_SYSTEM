import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { DashboardView } from "@/components/dashboard-view";

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <AppLayout>
      <DashboardView />
    </AppLayout>
  ),
});
