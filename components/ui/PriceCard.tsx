import {
  Box,
  Button,
  Card,
  Divider,
  Group,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconCheck, IconStarFilled } from "@tabler/icons-react";
import Link from "next/link";

interface PriceCardProps {
  price: string;
  period: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  footerText?: string;
  popular?: boolean;
}

export function PriceCard({
  price,
  period,
  features,
  ctaText,
  ctaLink,
  footerText,
  popular = false,
}: PriceCardProps) {
  return (
    <Card
      shadow="md"
      padding={0}
      radius="md"
      withBorder
      style={{
        backgroundColor: "white",
        boxShadow: popular
          ? "0 10px 30px rgba(57, 192, 186, 0.2)"
          : "0 8px 20px rgba(0, 0, 0, 0.15)",
        overflow: "visible",
        position: "relative",
        borderColor: popular ? "#39c0ba" : undefined,
        borderWidth: popular ? "2px" : "1px",
      }}
    >
      {popular && (
        <Box
          style={{
            position: "absolute",
            top: -12,
            right: 20,
            background: "linear-gradient(45deg, #3498db, #39c0ba)",
            borderRadius: "4px",
            padding: "4px 12px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Group gap={5} align="center">
            <IconStarFilled size={14} color="white" />
            <Text size="xs" fw={600} c="white">
              POPULAR
            </Text>
          </Group>
        </Box>
      )}

      <Box p="xl">
        <Stack align="center" gap="xs" mb="md">
          <Text c="dimmed" size="sm" tt="uppercase" fw={500}>
            Annual Plan
          </Text>
          <Group align="baseline" gap={5}>
            <Text
              style={{
                fontSize: "3.5rem",
                fontWeight: 800,
                background: "linear-gradient(45deg, #3498db, #39c0ba)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1,
              }}
            >
              {price}
            </Text>
            <Text c="dimmed" size="lg" fw={500}>
              /{period}
            </Text>
          </Group>
        </Stack>

        <Divider my="md" />

        <Stack gap="sm" mb="xl">
          {features.map((feature, index) => (
            <Group key={index} gap="xs" align="flex-start">
              <ThemeIcon
                size={22}
                radius="xl"
                color="teal"
                variant="light"
                style={{ marginTop: 2 }}
              >
                <IconCheck size={14} />
              </ThemeIcon>
              <Text size="sm">{feature}</Text>
            </Group>
          ))}
        </Stack>

        <Button
          size="md"
          radius="md"
          fullWidth
          style={{
            background: popular
              ? "linear-gradient(45deg, #3498db, #39c0ba)"
              : "linear-gradient(45deg, #3498db, #39c0ba)",
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
            fontSize: "1rem",
            fontWeight: 600,
            padding: "10px 0",
            transition: "transform 0.2s, box-shadow 0.2s",
            ":hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 6px 18px rgba(0, 0, 0, 0.2)",
            },
          }}
          component={Link}
          href={ctaLink}
        >
          {ctaText}
        </Button>

        {footerText && (
          <Text ta="center" size="xs" c="dimmed" mt="sm">
            {footerText}
          </Text>
        )}
      </Box>
    </Card>
  );
}
