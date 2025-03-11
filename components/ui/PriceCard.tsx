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
  features: string[];
  ctaText: string;
  ctaLink: string;
  footerText?: string;
  popular?: boolean;
}

export function PriceCard({
  price,
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
          <Group align="center" gap={5}>
            <Text
              variant="gradient"
              style={{
                fontSize: "3.5rem",
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              {price}
            </Text>
          </Group>
        </Stack>

        <Divider my="md" />

        <Stack gap="sm" mb="xl">
          {features.map((feature, index) => (
            <Group key={index} gap="xs" align="flex-start">
              <ThemeIcon size={22} radius="xl" style={{ marginTop: 2 }}>
                <IconCheck size={14} />
              </ThemeIcon>
              <Text size="sm">{feature}</Text>
            </Group>
          ))}
        </Stack>

        <Button variant="gradient" component={Link} href={ctaLink} fullWidth>
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
