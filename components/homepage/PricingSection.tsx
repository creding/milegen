import {
  Box,
  Button,
  Container,
  Grid,
  GridCol,
  Group,
  List,
  ListItem,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Badge,
} from "@mantine/core";
import {
  IconCheck,
  IconChevronRight,
  IconShieldCheck,
  IconRefresh,
} from "@tabler/icons-react";
import Link from "next/link";

export function PricingSection() {
  const features = [
    "Unlimited mileage logs",
    "IRS-compliant format",
    "Instant PDF downloads",
    "Save & access anytime",
    "Professional formatting",
    "Email support",
  ];

  return (
    <Box py={80} style={{ background: "#f8fafc" }}>
      <Container size="lg">
        <Grid gutter={60} align="center">
          <GridCol span={{ base: 12, md: 6 }}>
            <Stack gap="xl">
              <div>
                <Badge size="lg" variant="light" color="teal" mb="md">
                  Simple Pricing
                </Badge>
                <Title order={2} style={{ color: "#1a365d" }}>
                  One Price. Unlimited Logs.
                </Title>
                <Text size="lg" c="dimmed" mt="md">
                  No hidden fees. No monthly charges. Just straightforward
                  pricing that makes sense.
                </Text>
              </div>

              {/* Comparison */}
              <Paper
                p="lg"
                radius="md"
                withBorder
                style={{ borderColor: "#e2e8f0" }}
              >
                <Text size="sm" fw={600} c="gray.6" mb="md">
                  COMPARE THE VALUE
                </Text>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text c="dimmed">Other tracking apps</Text>
                    <Text fw={600} td="line-through" c="red.5">
                      $10-30/month
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text fw={600}>MileGen</Text>
                    <Text
                      fw={700}
                      style={{
                        background: "linear-gradient(90deg, #1a365d, #319795)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      $9.99/year
                    </Text>
                  </Group>
                </Stack>
              </Paper>

              {/* Guarantees */}
              <Group gap="xl">
                <Group gap="xs">
                  <ThemeIcon
                    size={28}
                    radius="xl"
                    color="green"
                    variant="light"
                  >
                    <IconRefresh size={16} />
                  </ThemeIcon>
                  <Text size="sm" fw={500}>
                    30-day money-back guarantee
                  </Text>
                </Group>
                <Group gap="xs">
                  <ThemeIcon size={28} radius="xl" color="blue" variant="light">
                    <IconShieldCheck size={16} />
                  </ThemeIcon>
                  <Text size="sm" fw={500}>
                    Secure checkout
                  </Text>
                </Group>
              </Group>
            </Stack>
          </GridCol>

          <GridCol span={{ base: 12, md: 6 }}>
            <Paper
              p="xl"
              radius="xl"
              style={{
                background: "linear-gradient(135deg, #1a365d 0%, #2d3748 100%)",
                border: "2px solid #319795",
                boxShadow: "0 25px 50px -12px rgba(26, 54, 93, 0.25)",
              }}
            >
              <Stack align="center" gap="lg">
                <Badge
                  size="lg"
                  variant="gradient"
                  gradient={{ from: "teal", to: "cyan" }}
                >
                  BEST VALUE
                </Badge>

                <div style={{ textAlign: "center" }}>
                  <Text
                    style={{
                      fontSize: "4rem",
                      fontWeight: 800,
                      color: "white",
                      lineHeight: 1,
                    }}
                  >
                    $9.99
                  </Text>
                  <Text size="lg" c="gray.4">
                    per year
                  </Text>
                </div>

                <List
                  spacing="sm"
                  size="md"
                  center
                  icon={
                    <ThemeIcon
                      size={20}
                      radius="xl"
                      variant="gradient"
                      gradient={{ from: "teal", to: "cyan" }}
                    >
                      <IconCheck size={14} />
                    </ThemeIcon>
                  }
                  styles={{
                    itemWrapper: { color: "white" },
                  }}
                >
                  {features.map((feature, index) => (
                    <ListItem key={index}>
                      <Text c="white" size="sm">
                        {feature}
                      </Text>
                    </ListItem>
                  ))}
                </List>

                <Link href="/?signup=true" style={{ width: "100%" }}>
                  <Button
                    size="xl"
                    radius="md"
                    fullWidth
                    variant="gradient"
                    gradient={{ from: "teal", to: "cyan" }}
                    rightSection={<IconChevronRight size={20} />}
                    styles={{
                      root: {
                        boxShadow: "0 4px 20px rgba(49, 151, 149, 0.4)",
                      },
                    }}
                  >
                    Get Started Now
                  </Button>
                </Link>

                <Text size="xs" c="gray.4" ta="center">
                  Instant access • No credit card required to browse
                </Text>
              </Stack>
            </Paper>
          </GridCol>
        </Grid>
      </Container>
    </Box>
  );
}
