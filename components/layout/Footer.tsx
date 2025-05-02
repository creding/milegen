import { createClient } from "@/lib/supabaseServerClient";
import {
  Box,
  Container,
  Divider,
  Group,
  Stack,
  Text,
  Title,
  Button,
  GridCol,
  Grid,
  Anchor,
} from "@mantine/core";
import { IconChevronRight, IconMail } from "@tabler/icons-react";
import Link from "next/link";

export const Footer = async () => {
  const year = new Date().getFullYear();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <Box component="footer" mt="auto">
      {!user && (
        <>
          {/* CTA Section */}
          <Box py={40} style={{ backgroundColor: "#1a2030" }}>
            <Container size="xl">
              <Group justify="space-between" align="center" wrap="wrap">
                <Stack gap="xs" maw={600}>
                  <Title order={2} c="white">
                    Ready to simplify your mileage tracking?
                  </Title>
                  <Text c="gray.3">
                    Join thousands of satisfied users who have streamlined their
                    mileage logging and maximized their tax deductions with
                    Milegen.
                  </Text>
                </Stack>
                <Button
                  size="lg"
                  radius="md"
                  style={{
                    background: "linear-gradient(45deg, #3498db, #2980b9)",
                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
                  }}
                  component={Link}
                  href={
                    user ? "/generator" : "/?login=true&redirect=/generator"
                  }
                  rightSection={<IconChevronRight size="1rem" />}
                >
                  Get Started Now
                </Button>
              </Group>
            </Container>
          </Box>
        </>
      )}
      {/* Main Footer */}
      <Box py={50} style={{ backgroundColor: "#0f1620" }}>
        <Container size="xl">
          <Grid>
            <GridCol span={{ base: 12, md: 6 }}>
              <Stack gap="md">
                <Title order={3} c="white">
                  Milegen
                </Title>
                <Text c="gray.5" size="sm">
                  Professional mileage logging made simple. Our automated system
                  helps you create IRS-compliant mileage logs in minutes, not
                  hours.
                </Text>
              </Stack>
            </GridCol>

            <GridCol span={{ base: 12, md: 3 }}>
              <Stack gap="md">
                <Title order={4} c="white">
                  Legal
                </Title>
                <Stack gap="xs">
                  <Anchor component={Link} href="/terms" c="gray.5" size="sm">
                    Terms of Service
                  </Anchor>
                  <Anchor component={Link} href="/privacy" c="gray.5" size="sm">
                    Privacy Policy
                  </Anchor>
                  <Anchor component={Link} href="/cookies" c="gray.5" size="sm">
                    Cookie Policy
                  </Anchor>
                </Stack>
              </Stack>
            </GridCol>

            <GridCol span={{ base: 12, md: 3 }}>
              <Stack gap="md">
                <Title order={4} c="white">
                  Contact Us
                </Title>
                <Stack gap="xs">
                  <Group gap="xs">
                    <IconMail size={16} color="#3498db" />
                    <Text c="gray.5" size="sm">
                      support@milegen.us
                    </Text>
                  </Group>
                </Stack>
              </Stack>
            </GridCol>
          </Grid>

          <Divider my={30} color="gray.8" />

          {/* Disclaimer Section */}
          <Box>
            <Text size="xs" c="gray.6" ta="center">
              <strong>Disclaimer:</strong> Milegen provides a tool for creating
              mileage logs based on user input. While our logs are designed to
              be IRS-compliant, we cannot guarantee acceptance by tax
              authorities. Users are responsible for ensuring the accuracy of
              their mileage records. Milegen is not a substitute for
              professional tax advice. Please consult with a qualified tax
              professional regarding your specific situation.
            </Text>
          </Box>

          <Divider my={30} color="gray.8" />

          {/* Copyright */}
          <Group justify="space-between" align="center" wrap="wrap">
            <Text size="sm" c="gray.5">
              &copy; {year} Milegen. All rights reserved.
            </Text>
          </Group>
        </Container>
      </Box>
    </Box>
  );
};
