import {
  Box,
  Container,
  Divider,
  Grid,
  GridCol,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconBuildingSkyscraper,
  IconBriefcase,
  IconCar,
  IconCertificate,
  IconChartBar,
  IconClipboardCheck,
  IconHome2,
  IconUserCheck,
} from "@tabler/icons-react";

export function SEOSection() {
  return (
    <Box py={80} style={{ backgroundColor: "#ffffff" }}>
      <Container size="xl">
        <Stack gap={60}>
          {/* Main Content Section */}
          <Grid gutter={40}>
            <GridCol span={{ base: 12, md: 6 }}>
              <Paper p="xl" radius="md" withBorder shadow="sm" h="100%">
                <Stack>
                  <Group>
                    <ThemeIcon
                      size={36}
                      radius="md"
                      color="blue"
                      variant="light"
                    >
                      <IconClipboardCheck size={20} />
                    </ThemeIcon>
                    <Title order={3} style={{ color: "#2c3e50" }}>
                      IRS-Compliant Mileage Logs Made Simple
                    </Title>
                  </Group>

                  <Text size="md" c="dimmed" mt="xs">
                    MileGen is the leading solution for creating accurate,
                    IRS-compliant mileage logs for tax deductions. Our platform
                    helps professionals maximize vehicle tax deductions while
                    ensuring full compliance with IRS requirements.
                  </Text>

                  <Divider my="sm" />

                  <Text size="md">
                    Our automated system generates detailed logs that include
                    all required information:
                  </Text>

                  <Grid gutter="xs">
                    {[
                      { text: "Date and time of travel" },
                      { text: "Starting point and destination" },
                      { text: "Business purpose of each trip" },
                      { text: "Exact mileage calculations" },
                      { text: "Professional formatting for tax filing" },
                      { text: "Audit-ready documentation" },
                    ].map((item, index) => (
                      <GridCol key={index} span={6}>
                        <Group gap="xs" align="flex-start">
                          <ThemeIcon
                            size="sm"
                            radius="xl"
                            color="blue"
                            variant="filled"
                          >
                            <IconChartBar size={12} />
                          </ThemeIcon>
                          <Text size="sm">{item.text}</Text>
                        </Group>
                      </GridCol>
                    ))}
                  </Grid>
                </Stack>
              </Paper>
            </GridCol>

            <GridCol span={{ base: 12, md: 6 }}>
              <Paper p="xl" radius="md" withBorder shadow="sm" h="100%">
                <Stack>
                  <Group>
                    <ThemeIcon
                      size={36}
                      radius="md"
                      color="blue"
                      variant="light"
                    >
                      <IconCertificate size={20} />
                    </ThemeIcon>
                    <Title order={3} style={{ color: "#2c3e50" }}>
                      Why Proper Mileage Documentation Matters
                    </Title>
                  </Group>

                  <Text size="md" c="dimmed" mt="xs">
                    The IRS standard mileage rate for 2025 is 67.5 cents per
                    business mile. Without proper documentation, you risk losing
                    thousands in potential tax savings or facing penalties
                    during an audit.
                  </Text>

                  <Divider my="sm" />

                  <Group mt="xs">
                    <ThemeIcon
                      size={48}
                      radius="md"
                      color="green"
                      variant="light"
                    >
                      <IconCar size={28} />
                    </ThemeIcon>
                    <div>
                      <Text fw={600}>Average Annual Savings</Text>
                      <Text size="xl" fw={700} style={{ color: "#27ae60" }}>
                        $3,500
                      </Text>
                      <Text size="xs" c="dimmed">
                        Based on customer reported tax deductions
                      </Text>
                    </div>
                  </Group>

                  <Text size="md" mt="md">
                    MileGen creates complete mileage records that satisfy IRS
                    requirements while saving you hours of manual
                    record-keeping—all for just $9.99 per year.
                  </Text>
                </Stack>
              </Paper>
            </GridCol>
          </Grid>

          {/* Industry Section */}
          <Paper p="xl" radius="md" withBorder shadow="sm">
            <Stack align="center" mb="lg">
              <Title order={3} ta="center" style={{ color: "#2c3e50" }}>
                Trusted by Professionals Across Industries
              </Title>
              <Text size="md" c="dimmed" maw={700} ta="center">
                Thousands of professionals rely on MileGen to simplify their tax
                documentation and maximize their business mileage deductions.
              </Text>
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
              {[
                {
                  icon: <IconHome2 size={24} />,
                  title: "Real Estate Agents",
                  text: "Track property showings and client visits with accurate mileage logs for maximum deductions.",
                },
                {
                  icon: <IconBriefcase size={24} />,
                  title: "Sales Professionals",
                  text: "Document client meetings and sales calls with IRS-compliant mileage records.",
                },
                {
                  icon: <IconBuildingSkyscraper size={24} />,
                  title: "Small Business Owners",
                  text: "Separate business and personal mileage for accurate tax filing and audit protection.",
                },
                {
                  icon: <IconUserCheck size={24} />,
                  title: "Independent Contractors",
                  text: "Maximize Schedule C deductions with proper documentation of all business travel.",
                },
              ].map((item, index) => (
                <Paper
                  key={index}
                  p="md"
                  radius="md"
                  withBorder
                  style={{ height: "100%" }}
                >
                  <Stack align="center" gap="sm">
                    <ThemeIcon
                      size={50}
                      radius="md"
                      color="blue"
                      variant="light"
                    >
                      {item.icon}
                    </ThemeIcon>
                    <Title order={3} ta="center" style={{ color: "#2c3e50" }}>
                      {item.title}
                    </Title>
                    <Text size="sm" c="dimmed" ta="center">
                      {item.text}
                    </Text>
                  </Stack>
                </Paper>
              ))}
            </SimpleGrid>
          </Paper>

          {/* SEO Footer - Hidden in plain sight */}
          <Box mt={20}>
            <Divider my="lg" />
            <Text size="xs" c="dimmed" ta="center" style={{ lineHeight: 1.6 }}>
              Serving professionals nationwide including New York, Los Angeles,
              Chicago, Houston, Phoenix, Philadelphia, San Antonio, San Diego,
              Dallas, and San Jose. Our IRS-compliant mileage tracking solution
              helps with tax deduction logs, business mileage tracking, vehicle
              expense deductions, standard mileage rate calculations, Schedule C
              deductions, self-employed mileage documentation, and
              industry-specific mileage tracking needs.
            </Text>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
