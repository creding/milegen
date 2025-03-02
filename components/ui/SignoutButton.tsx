"use client";

import { createClient } from "@/lib/supabaseBrowserClient";
import { Button } from "@mantine/core";
import { useRouter } from "next/navigation";

export function SignoutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <Button c="gray" variant="transparent" onClick={handleSignOut}>
      Sign Out
    </Button>
  );
}
