import Link from "next/link";
import { Button } from "@mantine/core";

interface SignUpButtonProps {
  variant?: "default" | "outline" | "white";
  className?: string;
}

export function SignUpButton({
  variant = "default",
  className = "",
}: SignUpButtonProps) {
  return (
    <Link href="/signup">
      <Button size="lg" variant={variant} className={className}>
        Sign Up
      </Button>
    </Link>
  );
}
