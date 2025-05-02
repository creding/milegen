"use client";

import { createClient } from "@/lib/supabaseBrowserClient";
import { useRouter } from "next/navigation";
import { ActionIcon, Tooltip } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";

export function SignoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <Tooltip label="Sign Out" position="bottom" withArrow>
      <ActionIcon
        variant="subtle" // Use subtle variant for less visual weight
        color="gray" // Use gray color
        onClick={handleSignOut}
        aria-label="Sign Out"
      >
        <IconLogout size="1.125rem" />
      </ActionIcon>
    </Tooltip>
  );
}
