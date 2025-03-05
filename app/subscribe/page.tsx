import { SubscribePage } from "@/components/pages/SubscribePage";
import { createClient } from "@/lib/supabaseServerClient";
import { redirect } from "next/navigation";
import { checkSubscriptionStatus } from "@/app/actions/checkSubscriptionStatus";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const subscriptionStatus = await checkSubscriptionStatus();
  if (subscriptionStatus === "active") {
    redirect("/generator");
  }

  return <SubscribePage />;
}
