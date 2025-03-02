import {
  Box,
  Button,
  Container,
  Divider,
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
  IconChevronRight,
  IconClock,
  IconReportAnalytics,
} from "@tabler/icons-react";
import Link from "next/link";

export function CTASection() {
  return (
    <Box py={80} style={{ backgroundColor: "#f8f9fa" }}>
      <Container size="xl">
        <Paper
          p="xl"
          radius="md"
          withBorder
          style={{
            background: "white",
            borderColor: "#e9ecef",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Grid gutter={40}>
            <GridCol span={{ base: 12, md: 7 }}>
              <Stack gap="md">
                <Title order={2} style={{ color: "#2c3e50" }}>
                  Say Goodbye to Tedious Mileage Tracking
                </Title>

                <Text size="lg" c="dimmed">
                  Creating detailed mileage logs is time-consuming and
                  frustrating. We&apos;ve simplified the process so you can
                  focus on what matters.
                </Text>

                <Divider my="sm" />

                <Group align="flex-start" gap="md">
                  <ThemeIcon
                    size={44}
                    radius="md"
                    variant="light"
                    color="blue"
                    style={{ marginTop: 4 }}
                  >
                    <IconClock size={24} />
                  </ThemeIcon>

                  <div style={{ flex: 1 }}>
                    <Text fw={600} mb={5}>
                      Save Hours of Tedious Work
                    </Text>
                    <Text size="sm" c="dimmed">
                      Stop wasting time with spreadsheets and manual
                      calculations. Generate comprehensive logs in minutes
                      instead of hours.
                    </Text>
                  </div>
                </Group>

                <Group align="flex-start" gap="md">
                  <ThemeIcon
                    size={44}
                    radius="md"
                    variant="light"
                    color="blue"
                    style={{ marginTop: 4 }}
                  >
                    <IconReportAnalytics size={24} />
                  </ThemeIcon>

                  <div style={{ flex: 1 }}>
                    <Text fw={600} mb={5}>
                      Eliminate the Hassle of Record-Keeping
                    </Text>
                    <Text size="sm" c="dimmed">
                      No more struggling with formatting, calculations, or
                      remembering what details to include. Our system handles
                      the complexity for you, creating organized records that
                      include all the essential information.
                    </Text>
                  </div>
                </Group>

                <Text size="xs" c="dimmed" mt="md">
                  Our service is for informational purposes only and does not
                  constitute tax or legal advice. By using our service, you
                  acknowledge that you have read and agree to our{" "}
                  <Link href="/terms" style={{ color: "#3498db" }}>
                    Terms of Service
                  </Link>
                  .
                </Text>
              </Stack>
            </GridCol>

            <GridCol
              span={{ base: 12, md: 5 }}
              style={{ display: "flex", alignItems: "center" }}
            >
              <Paper
                p="xl"
                radius="md"
                withBorder
                style={{
                  backgroundColor: "#f8f9fa",
                  borderColor: "#e9ecef",
                  width: "100%",
                }}
              >
                <Stack align="center" gap="lg">
                  <Title order={3} ta="center" style={{ color: "#2c3e50" }}>
                    Ready to Simplify Your Mileage Tracking?
                  </Title>

                  <Text c="dimmed" size="sm" ta="center">
                    Stop struggling with manual logs and complicated
                    spreadsheets. Generate professional mileage records in
                    minutes.
                  </Text>

                  <Button
                    size="lg"
                    radius="md"
                    fullWidth
                    style={{
                      backgroundColor: "#3498db",
                      transition: "all 0.3s ease",
                    }}
                    component={Link}
                    href="/?signup=true"
                    rightSection={<IconChevronRight size="1rem" />}
                  >
                    Create Your Log
                  </Button>
                </Stack>
              </Paper>
            </GridCol>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
