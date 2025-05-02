import { Box, Container, Title, Text, List, ListItem } from "@mantine/core";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | MileGen",
  description: "Cookie Policy for MileGen mileage tracking service",
};

export default function CookiePolicyPage() {
  return (
    <Box mt={60}>
      <Container size="md" py="xl">
        <Title order={1} mb="lg">
          Cookie Policy
        </Title>
        <Text mb="md">Last Updated: March 1, 2025</Text>

        <Text mb="xl">
          This Cookie Policy explains how Milegen uses cookies and similar
          technologies to recognize you when you visit our website and use our
          mileage tracking service. It explains what these technologies are and
          why we use them, as well as your rights to control our use of them.
        </Text>

        <Title order={2} mt="xl" mb="md">
          What Are Cookies?
        </Title>
        <Text mb="xl">
          Cookies are small data files that are placed on your computer or
          mobile device when you visit a website. Cookies are widely used by
          website owners to make their websites work, or to work more
          efficiently, as well as to provide reporting information. They help us
          to understand how visitors interact with our service, which allows us
          to improve your experience.
        </Text>

        <Title order={2} mt="xl" mb="md">
          Types of Cookies We Use
        </Title>
        <Text mb="md">We use the following types of cookies:</Text>
        <List mb="xl">
          <ListItem>
            <Text>
              <strong>Essential Cookies:</strong> These cookies are necessary
              for the website to function properly. They enable core
              functionality such as security, network management, and account
              access. You may disable these by changing your browser settings,
              but this may affect how the website functions.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              <strong>Analytics Cookies:</strong> These cookies allow us to
              count visits and traffic sources so we can measure and improve the
              performance of our site. They help us to know which pages are the
              most and least popular and see how visitors move around the site.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              <strong>Functionality Cookies:</strong> These cookies enable the
              website to provide enhanced functionality and personalization.
              They may be set by us or by third-party providers whose services
              we have added to our pages.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              <strong>Advertising Cookies:</strong> These cookies may be set
              through our site by our advertising partners. They may be used by
              those companies to build a profile of your interests and show you
              relevant advertisements on other sites.
            </Text>
          </ListItem>
        </List>

        <Title order={2} mt="xl" mb="md">
          How We Use Cookies
        </Title>
        <Text mb="md">We use cookies for several purposes, including:</Text>
        <List mb="xl">
          <ListItem>
            <Text>Authenticating users and remembering your login status</Text>
          </ListItem>
          <ListItem>
            <Text>Remembering your preferences and settings</Text>
          </ListItem>
          <ListItem>
            <Text>Analyzing how our website and service are used</Text>
          </ListItem>
          <ListItem>
            <Text>Personalizing your experience</Text>
          </ListItem>
          <ListItem>
            <Text>Improving our website and service</Text>
          </ListItem>
          <ListItem>
            <Text>Marketing and advertising purposes</Text>
          </ListItem>
        </List>

        <Title order={2} mt="xl" mb="md">
          Third-Party Cookies
        </Title>
        <Text mb="xl">
          In addition to our own cookies, we may also use various third-party
          cookies to report usage statistics of the service, deliver
          advertisements on and through the service, and so on. These cookies
          may remain on your device after you leave our website.
        </Text>

        <Title order={2} mt="xl" mb="md">
          Your Cookie Choices
        </Title>
        <Text mb="md">
          You have the right to decide whether to accept or reject cookies. You
          can exercise your cookie preferences in the following ways:
        </Text>
        <List mb="xl">
          <ListItem>
            <Text>
              <strong>Browser Settings:</strong> Most web browsers allow you to
              manage your cookie preferences. You can set your browser to refuse
              cookies or delete certain cookies. Generally, you can also manage
              similar technologies in the same way that you manage cookies using
              your browser&apos;s preferences.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              <strong>Cookie Consent Tool:</strong> We provide a cookie consent
              tool when you first visit our website that allows you to accept or
              decline non-essential cookies.
            </Text>
          </ListItem>
        </List>

        <Title order={2} mt="xl" mb="md">
          Changes to This Cookie Policy
        </Title>
        <Text mb="xl">
          We may update our Cookie Policy from time to time. We will notify you
          of any changes by posting the new Cookie Policy on this page and
          updating the &quot;Last Updated&quot; date. You are advised to review
          this Cookie Policy periodically for any changes.
        </Text>

        <Title order={2} mt="xl" mb="md">
          Contact Us
        </Title>
        <Text mb="xl">
          If you have any questions about this Cookie Policy, please contact us
          at support@milegen.us.
        </Text>
      </Container>
    </Box>
  );
}
