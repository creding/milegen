import { Button } from "@mantine/core";
import { IconLogin2 } from "@tabler/icons-react";
import Link from "next/link";

export function LoginButton() {
  return (
    <Button
      component={Link}
      href={{ pathname: "/", query: { login: true } }}
      leftSection={<IconLogin2 size={18} />}
      variant="gradient"
    >
      Log In
    </Button>
  );
}
