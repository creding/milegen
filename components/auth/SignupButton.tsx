import { Button } from "@mantine/core";
import { IconUserPlus } from "@tabler/icons-react";
import Link from "next/link";

export function SignupButton() {
  return (
    <Link href={{ pathname: "/", query: { signup: "true" } }}>
      <Button
        leftSection={<IconUserPlus size={18} />}
        variant="gradient"
        gradient={{ from: "blue", to: "cyan" }}
        radius="xl"
        size="sm"
        fw={600}
        style={{
          boxShadow: "0 4px 12px rgba(34, 139, 230, 0.25)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        Sign Up
      </Button>
    </Link>
  );
}
