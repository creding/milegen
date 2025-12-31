import Link from "next/link";
import { Anchor } from "@mantine/core";

export function SignUpButton() {
  return (
    <Link href="/?signup=true">
      <Anchor component="span">Sign Up</Anchor>
    </Link>
  );
}
