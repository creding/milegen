import {
  Box,
  Container,
  Grid,
  GridCol,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconClock,
  IconAlertTriangle,
  IconCurrencyDollar,
  IconDeviceMobile,
  IconArrowRight,
  IconCheck,
} from "@tabler/icons-react";

interface BenefitItem {
  pain: string;
  solution: string;
  painIcon: React.ElementType;
  solutionIcon: React.ElementType;
}

const benefits: BenefitItem[] = [
  {
    pain: "Hours spent tracking miles manually",
    solution: "Generate complete logs in under 2 minutes",
    painIcon: IconClock,
    solutionIcon: IconCheck,
  },
  {
    pain: "Fear of IRS audits and penalties",
    solution: "100% IRS-compliant format, audit-ready",
    painIcon: IconAlertTriangle,
    solutionIcon: IconCheck,
  },
  {
    pain: "Lost deductions from poor records",
    solution: "Capture every deductible mile automatically",
    painIcon: IconCurrencyDollar,
    solutionIcon: IconCheck,
  },
  {
    pain: "Expensive tracking apps ($10-30/month)",
    solution: "Just $9.99/year for unlimited logs",
    painIcon: IconDeviceMobile,
    solutionIcon: IconCheck,
  },
];

export function BenefitsSection() {
  return (
    <Box py={80} style={{ background: "#ffffff" }}>
      <Container size="xl">
        <Stack align="center" gap="xs" mb={50}>
          <Title order={2} ta="center" style={{ color: "#1a365d" }}>
            Why Professionals Choose MileGen
          </Title>
          <Text c="dimmed" ta="center" maw={600} size="lg">
            We solve the biggest pain points of mileage tracking so you can
            focus on your business
          </Text>
        </Stack>

        <Grid gutter={30}>
          {benefits.map((benefit, index) => (
            <GridCol key={index} span={{ base: 12, sm: 6 }}>
              <Paper
                p="xl"
                radius="lg"
                withBorder
                style={{
                  borderColor: "#e2e8f0",
                  transition: "all 0.2s ease",
                  height: "100%",
                }}
                className="hover-card"
              >
                <Group align="flex-start" gap="lg" wrap="nowrap">
                  {/* Pain side */}
                  <Stack gap="sm" style={{ flex: 1 }}>
                    <Group gap="xs">
                      <ThemeIcon
                        size={36}
                        radius="md"
                        variant="light"
                        color="red"
                      >
                        <benefit.painIcon size={20} />
                      </ThemeIcon>
                      <Text size="xs" tt="uppercase" fw={600} c="red.6">
                        The Problem
                      </Text>
                    </Group>
                    <Text size="sm" c="gray.7">
                      {benefit.pain}
                    </Text>
                  </Stack>

                  {/* Arrow */}
                  <ThemeIcon
                    size={28}
                    radius="xl"
                    variant="light"
                    color="teal"
                    style={{ marginTop: 20 }}
                  >
                    <IconArrowRight size={16} />
                  </ThemeIcon>

                  {/* Solution side */}
                  <Stack gap="sm" style={{ flex: 1 }}>
                    <Group gap="xs">
                      <ThemeIcon
                        size={36}
                        radius="md"
                        variant="gradient"
                        gradient={{ from: "teal", to: "cyan" }}
                      >
                        <benefit.solutionIcon size={20} />
                      </ThemeIcon>
                      <Text size="xs" tt="uppercase" fw={600} c="teal.6">
                        MileGen
                      </Text>
                    </Group>
                    <Text size="sm" fw={500} c="gray.8">
                      {benefit.solution}
                    </Text>
                  </Stack>
                </Group>
              </Paper>
            </GridCol>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
