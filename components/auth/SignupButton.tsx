import { Button } from "@mantine/core";
import { IconUserPlus } from "@tabler/icons-react";
import Link from "next/link";

export function SignupButton() {
  return (
    <Link href={{ pathname: "/", query: { signup: "true" } }}>
      <Button leftSection={<IconUserPlus size={18} />} variant="gradient">
        Sign Up
      </Button>
    </Link>
  );
}
