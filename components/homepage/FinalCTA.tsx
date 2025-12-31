import {
  Box,
  Button,
  Container,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconChevronRight,
  IconRefresh,
  IconShieldCheck,
} from "@tabler/icons-react";
import Link from "next/link";

export function FinalCTA() {
  return (
    <Box
      py={80}
      style={{
        background: "linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%)",
      }}
    >
      <Container size="md">
        <Stack align="center" gap="xl">
          <Title order={2} size="h1" ta="center" style={{ color: "#1a365d" }}>
            Tax Season is Here — Start Your Log Today
          </Title>

          <Text c="gray.6" ta="center" size="xl" maw={500}>
            Don&apos;t leave money on the table. Generate your IRS-compliant
            mileage log in minutes and maximize your deductions.
          </Text>

          <Group gap="lg">
            <Group gap="xs">
              <ThemeIcon size={24} radius="xl" color="green" variant="light">
                <IconRefresh size={14} />
              </ThemeIcon>
              <Text size="sm" fw={500} c="gray.7">
                30-day money-back guarantee
              </Text>
            </Group>
            <Group gap="xs">
              <ThemeIcon size={24} radius="xl" color="blue" variant="light">
                <IconShieldCheck size={14} />
              </ThemeIcon>
              <Text size="sm" fw={500} c="gray.7">
                100% IRS-compliant
              </Text>
            </Group>
          </Group>

          <Link href="/?signup=true">
            <Button
              size="xl"
              radius="md"
              variant="gradient"
              gradient={{ from: "teal", to: "cyan" }}
              rightSection={<IconChevronRight size={20} />}
              styles={{
                root: {
                  boxShadow: "0 4px 20px rgba(49, 151, 149, 0.4)",
                },
              }}
            >
              Get Started — Just $9.99/Year
            </Button>
          </Link>

          <Text size="sm" c="dimmed">
            Instant access • Unlimited logs • Cancel anytime
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
