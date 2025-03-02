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
                Effortless Mileage Logging. Unlimited Logs.
              </Title>
              <Text
                style={{
                  fontSize: "2.5rem",
                  color: "white",
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                Just $9.99/Year.
              </Text>
              <Text
                size="md"
                c="white"
                style={{ fontSize: "1rem", maxWidth: "80%" }}
              >
                Simplify your mileage tracking with Milegen. Built with modern
                technology for a seamless experience.
              </Text>
            </Stack>
          </GridCol>

          <GridCol span={{ base: 12, md: 5 }}>
            <PriceCard
              price="$9.99"
              period="per year"
              features={[
                "Unlimited Mileage Logs",
                "Save, Print, & Download",
                "Full Access",
              ]}
              ctaText="Subscribe Now"
              ctaLink="/signup"
              footerText="Secure payment • Instant access"
            />
          </GridCol>
        </Grid>
      </Container>
    </Box>
  );
}
