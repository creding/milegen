import { Box, Container, Group, Text, ThemeIcon } from "@mantine/core";
import {
  IconShieldCheck,
  IconLock,
  IconBolt,
  IconStar,
} from "@tabler/icons-react";

export function TrustSection() {
  const stats = [
    { value: "10,000+", label: "Logs Generated" },
    { value: "$2.5M+", label: "Deductions Claimed" },
    { value: "4.9★", label: "User Rating" },
  ];

  const badges = [
    { icon: IconShieldCheck, label: "IRS Compliant" },
    { icon: IconLock, label: "Secure & Private" },
    { icon: IconBolt, label: "Instant Access" },
    { icon: IconStar, label: "5-Star Support" },
  ];

  return (
    <Box
      py={40}
      style={{
        background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
        borderBottom: "1px solid #e2e8f0",
      }}
    >
      <Container size="xl">
        {/* Stats row */}
        <Group justify="center" gap={60} mb={30}>
          {stats.map((stat, index) => (
            <Box key={index} ta="center">
              <Text
                size="2rem"
                fw={800}
                style={{
                  background: "linear-gradient(90deg, #1a365d, #319795)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {stat.value}
              </Text>
              <Text size="sm" c="dimmed" tt="uppercase" fw={500}>
                {stat.label}
              </Text>
            </Box>
          ))}
        </Group>

        {/* Trust badges row */}
        <Group justify="center" gap={40}>
          {badges.map((badge, index) => (
            <Group key={index} gap="xs">
              <ThemeIcon size={32} radius="xl" variant="light" color="teal">
                <badge.icon size={18} />
              </ThemeIcon>
              <Text size="sm" fw={500} c="gray.7">
                {badge.label}
              </Text>
            </Group>
          ))}
        </Group>
      </Container>
    </Box>
  );
}
