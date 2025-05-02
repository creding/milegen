import { Box, Container, Title, Text, List, ListItem } from "@mantine/core";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | MileGen",
  description: "Privacy Policy for MileGen mileage tracking service",
};

export default function PrivacyPolicyPage() {
  return (
    <Box mt={60}>
      <Container size="md" py="xl">
        <Title order={1} mb="lg">
          Privacy Policy
        </Title>
        <Text mb="md">Last Updated: March 1, 2025</Text>

        <Text mb="md">
          At Milegen, we take your privacy seriously. This Privacy Policy
          explains how we collect, use, disclose, and safeguard your information
          when you visit our website and use our mileage tracking service.
        </Text>

        <Title order={2} mt="xl" mb="md">
          Information We Collect
        </Title>
        <Text mb="md">
          We may collect information about you in various ways, including:
        </Text>
        <List mb="xl">
          <ListItem>
            <Text>
              <strong>Personal Data:</strong> Name, email address, phone number,
              and billing information when you create an account or subscribe to
              our service.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              <strong>Mileage Information:</strong> Starting and ending odometer
              readings, trip dates, and business purposes that you input into
              our system.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              <strong>Usage Data:</strong> Information about how you use our
              website and service, including IP address, browser type, pages
              visited, and time spent on the site.
            </Text>
          </ListItem>
        </List>

        <Title order={2} mt="xl" mb="md">
          How We Use Your Information
        </Title>
        <Text mb="md">
          We use the information we collect for various purposes, including:
        </Text>
        <List mb="xl">
          <ListItem>
            <Text>Providing and maintaining our service</Text>
          </ListItem>
          <ListItem>
            <Text>Processing your payments and subscriptions</Text>
          </ListItem>
          <ListItem>
            <Text>Generating your mileage logs based on your inputs</Text>
          </ListItem>
          <ListItem>
            <Text>Improving our website and service</Text>
          </ListItem>
          <ListItem>
            <Text>
              Communicating with you about updates, support, and marketing
            </Text>
          </ListItem>
        </List>

        <Title order={2} mt="xl" mb="md">
          Data Storage and Security
        </Title>
        <Text mb="xl">
          We implement appropriate technical and organizational measures to
          protect your personal data against unauthorized access, alteration,
          disclosure, or destruction. However, no method of transmission over
          the Internet or electronic storage is 100% secure, and we cannot
          guarantee absolute security.
        </Text>

        <Title order={2} mt="xl" mb="md">
          Third-Party Services
        </Title>
        <Text mb="xl">
          We may use third-party services to facilitate our service, process
          payments, or analyze how our service is used. These third parties have
          access to your personal data only to perform specific tasks on our
          behalf and are obligated not to disclose or use it for any other
          purpose.
        </Text>

        <Title order={2} mt="xl" mb="md">
          Your Rights
        </Title>
        <Text mb="md">
          Depending on your location, you may have the following rights:
        </Text>
        <List mb="xl">
          <ListItem>
            <Text>Access to your personal data</Text>
          </ListItem>
          <ListItem>
            <Text>Correction of inaccurate or incomplete data</Text>
          </ListItem>
          <ListItem>
            <Text>Deletion of your personal data</Text>
          </ListItem>
          <ListItem>
            <Text>Restriction of processing of your personal data</Text>
          </ListItem>
          <ListItem>
            <Text>Data portability</Text>
          </ListItem>
        </List>

        <Title order={2} mt="xl" mb="md">
          Changes to This Privacy Policy
        </Title>
        <Text mb="xl">
          We may update our Privacy Policy from time to time. We will notify you
          of any changes by posting the new Privacy Policy on this page and
          updating the &quot;Last Updated&quot; date. You are advised to review
          this Privacy Policy periodically for any changes.
        </Text>

        <Title order={2} mt="xl" mb="md">
          Contact Us
        </Title>
        <Text mb="xl">
          If you have any questions about this Privacy Policy, please contact us
          at support@milegen.us.
        </Text>
      </Container>
    </Box>
  );
}
