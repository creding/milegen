"use client";

import { createClient } from "@/lib/supabaseBrowserClient";
import { Anchor } from "@mantine/core";
import { useRouter } from "next/navigation";

export function SignoutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return <Anchor onClick={handleSignOut}>Sign Out</Anchor>;
}
