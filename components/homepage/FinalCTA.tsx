import {
  Box,
  Button,
  Container,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";

export function FinalCTA() {
  return (
    <Box
      py={80}
      style={{ background: "linear-gradient(to right, #f8f9fa, #e5f9ff)" }}
    >
      <Container size="sm">
        <Stack align="center" gap="xl">
          <Title
            order={2}
            size="h1"
            ta="center"
            mb="sm"
            style={{ color: "#3498db" }}
          >
            Ready to Create Your Mileage Log?
          </Title>
          <Text c="dimmed" ta="center" size="xl" mb="xl">
            Start generating IRS-compliant mileage logs in minutes
          </Text>
          <Button
            size="xl"
            radius="md"
            style={{
              background: "linear-gradient(to right, #3498db, #39c0ba)",
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
              transition: "all 0.2s ease",
              fontSize: "1.2rem",
            }}
            component={Link}
            href="/signup"
            rightSection={<IconChevronRight size="1.2rem" />}
            className="hero-button"
          >
            Get Started Now
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
