import { SubscribePage } from "@/components/pages/SubscribePage";
import { createClient } from "@/lib/supabaseServerClient";
import { redirect } from "next/navigation";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <SubscribePage />;
}
