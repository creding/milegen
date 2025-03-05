import Link from "next/link";
import { Anchor } from "@mantine/core";

export function SignUpButton() {
  return (
    <Anchor component={Link} href="/?signup=true">
      Sign Up
    </Anchor>
  );
}
