import { Button } from "@mantine/core";
import { IconLogin2 } from "@tabler/icons-react";
import Link from "next/link";

export function LoginButton() {
  return (
    <>
      <Link href={{ pathname: "/", query: { login: true } }}>
        <Button leftSection={<IconLogin2 />} variant="transparent">
          Log In
        </Button>
      </Link>
    </>
  );
}
