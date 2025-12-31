import { Button } from "@mantine/core";
import { IconLogin2 } from "@tabler/icons-react";
import Link from "next/link";

export function LoginButton() {
  return (
    <Link href={{ pathname: "/", query: { login: "true" } }}>
      <Button
        leftSection={<IconLogin2 size={18} />}
        variant="default"
        radius="xl"
        size="sm"
        fw={500}
        style={{ border: "1px solid transparent", boxShadow: "none" }}
      >
        Log In
      </Button>
    </Link>
  );
}
