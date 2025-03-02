import Link from "next/link";
import { Anchor, Button } from "@mantine/core";

interface SignUpButtonProps {
  variant?: "default" | "outline" | "white";
  className?: string;
}

export function SignUpButton({
  variant = "default",
  className = "",
}: SignUpButtonProps) {
  return (
    <Anchor component={Link} href="/?signup=true">
      Sign Up
    </Anchor>
  );
}
