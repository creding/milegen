"use client";

import Link from "next/link";
import { IconCar } from "@tabler/icons-react";
import { Group, Text, Box } from "@mantine/core";

export function Logo() {
  return (
    <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
      <Group gap={12} align="center">
        <Box
          style={{
            background: "linear-gradient(135deg, #228be6, #15aabf)",
            borderRadius: "10px",
            width: 38,
            height: 38,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(21, 170, 191, 0.25)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <IconCar size={22} stroke={2} color="white" />
        </Box>
        <Text
          size="1.35rem"
          fw={800}
          c="gray.9"
          style={{
            lineHeight: 1,
            letterSpacing: "-0.02em",
            fontFamily: "var(--mantine-font-family-headings)",
          }}
        >
          Milegen
        </Text>
      </Group>
    </Link>
  );
}
