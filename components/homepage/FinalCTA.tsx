import { Box, Button, Container, Stack, Text, Title } from "@mantine/core";
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
            variant="gradient"
            component={Link}
            href="/?signup=true"
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
