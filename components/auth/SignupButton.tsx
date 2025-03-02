import { Button } from "@mantine/core";
import { IconUserPlus } from "@tabler/icons-react";
import Link from "next/link";

export function SignupButton() {
  return (
    <Button
      component={Link}
      href={{ pathname: "/", query: { signup: true } }}
      leftSection={<IconUserPlus size={18} />}
      variant="gradient"
    >
      Sign Up
    </Button>
  );
}
