import {
  Box,
  Button,
  Container,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconCar, IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

export function StepsSection({ user }: { user: User | null }) {
  // Process steps
  const processSteps = [
    {
      number: "1",
      title: "Enter Basic Info",
      description:
        "Simply enter your odometer readings, date range, and personal miles.",
      buttonText: "Start Now",
      buttonLink: "/?signup=true",
      color: "#3498db",
    },
    {
      number: "2",
      title: "Instant Generation",
      description:
        "Our system automatically creates your mileage log with realistic business trips.",
      buttonText: "See How It Works",
      buttonLink: "#how-it-works",
      color: "#2980b9",
    },
    {
      number: "3",
      title: "Download & Save",
      description:
        "Get your IRS-compliant log in PDF format instantly. Securely stored for easy access.",
      buttonText: "Get Started",
      buttonLink: "/?signup=true",
      color: "#1f618d",
    },
  ];

  return (
    <Box py={60} id="how-it-works">
      <Container size="xl">
        <Paper radius="md" withBorder shadow="sm">
          <Stack p="lg" gap="xl">
            <Stack align="center" gap="xs">
              <Title order={2} ta="center" c="blue.9">
                Create Your Mileage Log in 3 Simple Steps
              </Title>
              <Text c="dimmed" ta="center" maw={700} size="md" mx="auto">
                No complicated setup or manual tracking. Generate IRS-compliant
                logs in minutes.
              </Text>
              <Divider w="15%" my="sm" />
            </Stack>

            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
              {processSteps.map((step, index) => (
                <Paper
                  key={index}
                  radius="md"
                  withBorder
                  p="md"
                  className="hover-card"
                  style={{
                    borderTop: `3px solid ${step.color}`,
                  }}
                >
                  <Stack gap="md">
                    <Group gap="md" align="center">
                      <ThemeIcon
                        size={42}
                        radius="md"
                        style={{ backgroundColor: step.color }}
                      >
                        <Text fw={700} c="white" size="xl">
                          {step.number}
                        </Text>
                      </ThemeIcon>
                      <Title order={3} c="blue.9">
                        {step.title}
                      </Title>
                    </Group>

                    <Text size="sm" c="dimmed">
                      {step.description}
                    </Text>
                  </Stack>
                </Paper>
              ))}
            </SimpleGrid>

            <Box mt={10}>
              <Paper p="md" radius="md" withBorder bg="gray.0">
                <Group justify="apart" align="center">
                  <Group gap="md">
                    <ThemeIcon size={42} radius="xl" color="blue">
                      <IconCar size={24} />
                    </ThemeIcon>
                    <div>
                      <Text fw={600} size="lg" c="blue.9">
                        Ready to Simplify Your Mileage Tracking?
                      </Text>
                      <Text size="sm" c="dimmed">
                        Start tracking your miles in minutes, not hours
                      </Text>
                    </div>
                  </Group>
                  <Button
                    size="md"
                    radius="md"
                    component={Link}
                    href={
                      user ? "/generator" : "/?login=true&redirect=/generator"
                    }
                    rightSection={<IconChevronRight size="1rem" />}
                    variant="gradient"
                  >
                    Create Your First Log
                  </Button>
                </Group>
              </Paper>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
