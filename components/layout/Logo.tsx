"use client";

import Link from "next/link";
import { IconCar } from "@tabler/icons-react";
import { Group, Text } from "@mantine/core";

export function Logo() {
  return (
    <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
      <Group gap="xs">
        <IconCar size={24} stroke={1.5} />
        <Text size="xl" fw={700}>
          Milegen
        </Text>
      </Group>
    </Link>
  );
}
