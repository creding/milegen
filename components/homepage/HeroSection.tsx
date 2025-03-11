import {
  Box,
  Container,
  Grid,
  GridCol,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import heroImage from "@/images/hero.jpg";
import { PriceCard } from "@/components/ui/PriceCard";

export function HeroSection() {
  return (
    <Box
      pt={120}
      pb={100}
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${heroImage.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
      }}
    >
      <Container size="lg">
        <Grid gutter={40} align="center">
          <GridCol span={{ base: 12, md: 7 }}>
            <Stack gap="lg">
              <Title
                order={1}
                style={{
                  fontSize: "3.5rem",
                  fontWeight: 700,
                  color: "white",
                  lineHeight: 1.1,
                }}
              >
                Simplify Your Mileage Tracking
              </Title>
              <Text
                style={{
                  fontSize: "2.5rem",
                  color: "white",
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                Try it Now for Free
              </Text>
              <Text
                size="md"
                c="white"
                style={{ fontSize: "1rem", maxWidth: "80%" }}
              >
                Create a log with up to 10 entries. Subscribe to unlock full
                access, including save, download, and print features.
              </Text>
            </Stack>
          </GridCol>

          <GridCol span={{ base: 12, md: 5 }}>
            <PriceCard
              price="Start Free"
              features={[
                "IRS-Compliant Logs",
                "Instant Preview",
                "No Credit Card Required",
              ]}
              ctaText="Create Your First Log"
              ctaLink="/?signup=true"
              footerText="Subscribe to unlock all features"
            />
          </GridCol>
        </Grid>
      </Container>
    </Box>
  );
}
