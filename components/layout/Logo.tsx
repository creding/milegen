"use client";

import Link from "next/link";
import { IconCar } from "@tabler/icons-react";
import { Group, Text, Box } from "@mantine/core";

export function Logo() {
  return (
    <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
      <Group gap="xs" style={{ transition: "transform 0.2s" }} align="center">
        <Box
          style={{
            background: "linear-gradient(45deg, #3498db, #39c0ba)",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 10px rgba(57, 192, 186, 0.3)",
            transition: "transform 0.2s, box-shadow 0.2s",
            ":hover": {
              transform: "scale(1.05)",
              boxShadow: "0 4px 12px rgba(57, 192, 186, 0.4)",
            },
          }}
        >
          <IconCar size={22} stroke={1.5} color="white" />
        </Box>
        <Text
          size="xl"
          fw={800}
          variant="gradient"
        >
          Milegen
        </Text>
      </Group>
    </Link>
  );
}
