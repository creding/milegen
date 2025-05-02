import { SavedLogsPage } from "@/components/pages/SavedLogsPage";
import { getUserSavedLogs } from "@/lib/data/getUserSavedLogs";
import { Suspense } from "react";
import { SavedLogsLoadingSkeleton } from "@/components/pages/SavedLogsLoadingSkeleton";
import { createClient } from "@/lib/supabaseServerClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page() {
  // Fetch logs using the dedicated data access function
  const logs = await getUserSavedLogs();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/?login=true&redirect=/saved-logs");
  }

  return (
    <Suspense fallback={<SavedLogsLoadingSkeleton />}>
      <SavedLogsPage logs={logs} />
    </Suspense>
  );
}
