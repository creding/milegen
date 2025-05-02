import {
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
import Link from "next/link";
import { IconDownload } from "@tabler/icons-react";
import { User } from "@supabase/supabase-js";
import Image from "next/image";

export function HeroSection({ user }: { user: User | null }) {
  return (
    <Box
      component="section"
      style={{
        paddingTop: "calc(var(--mantine-spacing-xl) * 4)",
        paddingBottom: "calc(var(--mantine-spacing-xl) * 3)",
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(135deg, var(--mantine-color-gray-0) 0%, var(--mantine-color-blue-0) 100%), url('/images/milegen-log.png')`,
        backgroundSize: "cover, 40%",
        backgroundPosition: "center, 80% 10px",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Container size="lg">
        <Grid gutter={{ base: 40, md: 80 }} align="stretch">
          {/* Left Column: Text & CTAs */}
          <GridCol
            span={{ base: 12, md: 7 }}
            style={{ position: "relative", zIndex: 1 }}
          >
            <Stack gap="lg">
              <Title
                order={1}
                fw={700}
                style={{
                  fontSize: "rem(44px)",
                  lineHeight: 1.2,
                  textShadow: "1px 1px 3px rgba(0, 0, 0, 0.2)",
                  color: "var(--mantine-color-black)",
                }}
              >
                Effortless Mileage Logging, Maximum Deductions.
              </Title>

              <Text
                size="xl"
                c="gray.7"
                style={{
                  lineHeight: 1.6,
                  textShadow: "1px 1px 2px rgba(0, 0, 0, 0.15)",
                }}
              >
                Generate accurate, IRS-compliant mileage logs in seconds. Stop
                guessing, start saving.
              </Text>

              <Group mt="lg" gap="sm">
                <Button
                  size="lg"
                  variant="gradient"
                  gradient={{ from: "blue", to: "cyan", deg: 90 }}
                  component={Link}
                  href={
                    user ? "/generator" : "/?login=true&redirect=/generator"
                  }
                >
                  Generate Your Log Now
                </Button>
                <Button
                  size="lg"
                  variant="default"
                  leftSection={<IconDownload size={20} />}
                  component="a"
                  href="/api/download-sample"
                  download="milegen-sample-log.csv"
                >
                  Download Sample
                </Button>
              </Group>
            </Stack>
          </GridCol>

          {/* Right Column: Visual Placeholder */}
          <GridCol span={{ base: 12, md: 5 }} visibleFrom="md">
            <Image
              src="/images/milegen-log.png"
              alt="Milegen Log"
              height={400}
              width={600}
              style={{
                borderRadius: "var(--mantine-radius-md)",
                boxShadow: "var(--mantine-shadow-md)",
                maxWidth: "100%", // Ensure image stays within column
                height: "auto", // Maintain aspect ratio
              }}
            />
          </GridCol>
        </Grid>
      </Container>
    </Box>
  );
}
