import { Button } from "@mantine/core";
import { IconLogin } from "@tabler/icons-react";
import Link from "next/link";

export function LoginButton() {
  return (
    <Button
      component={Link}
      href={{ pathname: "/", query: { login: true } }}
      leftSection={<IconLogin size={18} />}
      variant="subtle"
      color="gray"
    >
      Log In
    </Button>
  );
}
