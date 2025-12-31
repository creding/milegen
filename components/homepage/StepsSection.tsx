import {
  Box,
  Button,
  Container,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Badge,
} from "@mantine/core";
import {
  IconFileDescription,
  IconBolt,
  IconDownload,
  IconChevronRight,
} from "@tabler/icons-react";
import Link from "next/link";

interface Step {
  number: string;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

const steps: Step[] = [
  {
    number: "1",
    icon: IconFileDescription,
    title: "Enter Your Details",
    description:
      "Input your odometer readings, date range, and the number of personal miles. Takes less than 2 minutes.",
    color: "#3182ce",
  },
  {
    number: "2",
    icon: IconBolt,
    title: "Instant Generation",
    description:
      "Our system automatically creates a complete mileage log with realistic business trips and destinations.",
    color: "#319795",
  },
  {
    number: "3",
    icon: IconDownload,
    title: "Download & Save",
    description:
      "Get your IRS-compliant log as a professional PDF. Access anytime from your account.",
    color: "#38a169",
  },
];

export function StepsSection() {
  return (
    <Box py={80} id="how-it-works" style={{ background: "#ffffff" }}>
      <Container size="xl">
        <Stack align="center" gap="xs" mb={50}>
          <Badge size="lg" variant="light" color="blue" mb="sm">
            How It Works
          </Badge>
          <Title order={2} ta="center" style={{ color: "#1a365d" }}>
            Create Your Mileage Log in 3 Simple Steps
          </Title>
          <Text c="dimmed" ta="center" maw={600} size="lg">
            No complicated setup. No manual tracking. Just fast, accurate logs.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mb={50}>
          {steps.map((step, index) => (
            <Paper
              key={index}
              p="xl"
              radius="lg"
              withBorder
              style={{
                borderTop: `4px solid ${step.color}`,
                borderColor: "#e2e8f0",
                transition: "all 0.2s ease",
              }}
              className="hover-card"
            >
              <Stack gap="md">
                <Group gap="md" align="center">
                  <ThemeIcon
                    size={52}
                    radius="lg"
                    style={{ backgroundColor: step.color }}
                  >
                    <step.icon size={28} color="white" />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                      Step {step.number}
                    </Text>
                    <Title order={4} style={{ color: "#1a365d" }}>
                      {step.title}
                    </Title>
                  </div>
                </Group>

                <Text size="md" c="gray.6" lh={1.6}>
                  {step.description}
                </Text>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>

        {/* CTA banner */}
        <Paper
          p="xl"
          radius="lg"
          style={{
            background: "linear-gradient(135deg, #1a365d 0%, #2d3748 100%)",
          }}
        >
          <Group justify="space-between" align="center" wrap="wrap" gap="lg">
            <div>
              <Text size="xl" fw={700} c="white">
                Ready to simplify your mileage tracking?
              </Text>
              <Text c="gray.4">
                Join thousands of professionals saving time with MileGen
              </Text>
            </div>
            <Link href="/?signup=true">
              <Button
                size="lg"
                radius="md"
                variant="gradient"
                gradient={{ from: "teal", to: "cyan" }}
                rightSection={<IconChevronRight size={18} />}
              >
                Create Your First Log
              </Button>
            </Link>
          </Group>
        </Paper>
      </Container>
    </Box>
  );
}
