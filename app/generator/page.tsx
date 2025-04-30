import { createClient } from "@/lib/supabaseServerClient";
import { checkSubscriptionStatus } from "@/app/actions/checkSubscriptionStatus";
import { GeneratorPage } from "@/components/pages/GeneratorPage";
import { redirect } from "next/navigation";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  const subscriptionStatus = await checkSubscriptionStatus();

  return <GeneratorPage subscriptionStatus={subscriptionStatus} />;
}
