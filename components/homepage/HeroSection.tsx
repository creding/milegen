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
import milegenLog from "@/images/milegen-log.webp";
import milegenHeroBkg from "@/images/milegen-hero-bkg.webp";
export function HeroSection({ user }: { user: User | null }) {
  return (
    <Box
      component="section"
      style={{
        paddingTop: "calc(var(--mantine-spacing-xl) * 4)",
        paddingBottom: "calc(var(--mantine-spacing-xl) * 3)",
        position: "relative",
        overflow: "hidden",
        backgroundImage: `linear-gradient(135deg, 
          rgba(240, 249, 255, 0.25) 0%, 
          rgba(224, 242, 254, 0.2) 25%,
          rgba(186, 230, 253, 0.15) 50%,
          rgba(125, 211, 252, 0.1) 75%,
          rgba(56, 189, 248, 0.05) 100%),
          url(${milegenHeroBkg.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Container size="lg">
        <Grid gutter={{ base: 40, md: 80 }} align="stretch">
          {/* Left Column: Text & CTAs */}
          <GridCol span={{ base: 12, md: 7 }}>
            <Stack gap="lg">
              <Title c="blue.9" order={1} fw={700} lh={1.2}>
                Effortless Mileage Logging, Maximum Deductions.
              </Title>

              <Text size="xl" c="gray.7" lh={1.4}>
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
                  href="/sample-mileage-log.pdf" // Point to static PDF in public/
                  download="sample-mileage-log.pdf"
                >
                  Download Sample
                </Button>
              </Group>
            </Stack>
          </GridCol>

          {/* Right Column: Visual Placeholder */}
          <GridCol span={{ base: 12, md: 5 }} visibleFrom="md">
            <Image
              src={milegenLog}
              alt="Milegen Log"
              height={400}
              width={600}
              sizes="42vw"
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
