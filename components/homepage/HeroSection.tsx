import {
  Badge,
  Box,
  Button,
  Container,
  Grid,
  GridCol,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconChevronRight,
  IconShieldCheck,
  IconClock,
  IconDownload,
} from "@tabler/icons-react";
import Link from "next/link";
import { HeroGraphic } from "./HeroGraphic";

export function HeroSection() {
  return (
    <Box
      pt={100}
      pb={80}
      style={{
        background:
          "linear-gradient(135deg, #1a365d 0%, #2d3748 50%, #1a365d 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative elements */}
      <Box
        style={{
          position: "absolute",
          top: "-50%",
          right: "-20%",
          width: "80%",
          height: "200%",
          background:
            "radial-gradient(circle, rgba(49, 151, 149, 0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Container size="xl">
        <Grid gutter={60} align="center">
          <GridCol span={{ base: 12, md: 6 }}>
            <Stack gap="xl">
              {/* Trust badge */}
              <Group gap="xs">
                <Badge
                  size="lg"
                  variant="gradient"
                  gradient={{ from: "teal", to: "cyan" }}
                  leftSection={<IconShieldCheck size={14} />}
                >
                  IRS-Compliant
                </Badge>
                <Badge size="lg" variant="light" color="gray">
                  Trusted by 5,000+ professionals
                </Badge>
              </Group>

              {/* Main headline - Process focused */}
              <Title
                order={1}
                style={{
                  fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                  fontWeight: 800,
                  color: "white",
                  lineHeight: 1.1,
                }}
              >
                Generate IRS-Ready Mileage Logs{" "}
                <Text
                  component="span"
                  inherit
                  style={{
                    background: "linear-gradient(90deg, #38b2ac, #4fd1c5)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  in Minutes
                </Text>
              </Title>

              {/* Subheadline */}
              <Text
                size="xl"
                style={{
                  color: "rgba(255, 255, 255, 0.85)",
                  maxWidth: "90%",
                  lineHeight: 1.6,
                }}
              >
                Stop spending hours on spreadsheets. Enter your trip details,
                and we&apos;ll automatically generate professional mileage logs
                ready for tax season.
              </Text>

              {/* Value props */}
              <Group gap="xl">
                <Group gap="xs">
                  <IconClock size={20} style={{ color: "#4fd1c5" }} />
                  <Text size="sm" c="white">
                    2-minute setup
                  </Text>
                </Group>
                <Group gap="xs">
                  <IconDownload size={20} style={{ color: "#4fd1c5" }} />
                  <Text size="sm" c="white">
                    Instant PDF download
                  </Text>
                </Group>
                <Group gap="xs">
                  <IconShieldCheck size={20} style={{ color: "#4fd1c5" }} />
                  <Text size="sm" c="white">
                    100% audit-ready
                  </Text>
                </Group>
              </Group>

              {/* CTA buttons */}
              <Group gap="md">
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
                        transition: "all 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 6px 25px rgba(49, 151, 149, 0.5)",
                        },
                      },
                    }}
                  >
                    Create Your First Log
                  </Button>
                </Link>
                <Link
                  href="https://oefbskcjvgqezwhepaqj.supabase.co/storage/v1/object/public/preview/mileage-log-2025-01-01-2025-12-31.pdf"
                  target="_blank"
                >
                  <Button
                    size="xl"
                    radius="md"
                    variant="outline"
                    color="gray"
                    leftSection={<IconDownload size={20} />}
                    styles={{
                      root: {
                        borderColor: "rgba(255, 255, 255, 0.3)",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                        },
                      },
                    }}
                  >
                    View Sample
                  </Button>
                </Link>
              </Group>

              {/* Pricing callout */}
              <Group gap="xs" mt="md">
                <Text size="lg" fw={700} style={{ color: "#4fd1c5" }}>
                  Just $9.99/year
                </Text>
                <Text size="sm" c="dimmed">
                  — Unlimited logs, instant access
                </Text>
              </Group>
            </Stack>
          </GridCol>

          <GridCol span={{ base: 12, md: 6 }}>
            <Box
              style={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <HeroGraphic />
            </Box>
          </GridCol>
        </Grid>
      </Container>
    </Box>
  );
}
