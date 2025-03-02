"use server";

import { SavedLogsPage } from "@/components/pages/SavedLogsPage";
import { createClient } from "@/lib/supabaseServerClient";
import { Suspense } from "react";

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Get saved logs if user exists
  let logs = [];
  if (user) {
    const { data, error } = await supabase
      .from("mileage_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) {
      logs = data;
    }
  }

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <SavedLogsPage logs={logs} />
    </Suspense>
  );
}
