import { SavedLogsPage } from "@/components/pages/SavedLogsPage";
import { getUserSavedLogs } from "@/lib/data/getUserSavedLogs";
import { Suspense } from "react";
import { SavedLogsLoadingSkeleton } from "@/components/pages/SavedLogsLoadingSkeleton";

export const dynamic = "force-dynamic";

export default async function Page() {
  // Fetch logs using the dedicated data access function
  const logs = await getUserSavedLogs();

  return (
    <Suspense fallback={<SavedLogsLoadingSkeleton />}>
      <SavedLogsPage logs={logs} />
    </Suspense>
  );
}
