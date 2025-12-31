import { Container, Box, Title, Text, Stack } from "@mantine/core";
import { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function PageLayout({
  children,
  title,
  subtitle,
  size = "xl",
}: PageLayoutProps) {
  return (
    <Box
      style={{
        minHeight: "100vh",
        background: "#f8fafc", // Cool gray background
        paddingTop: "40px",
        paddingBottom: "80px",
      }}
    >
      <Container size={size}>
        {(title || subtitle) && (
          <Stack
            gap="xs"
            mb={40}
            align="center"
            style={{ textAlign: "center" }}
          >
            {title && (
              <Title
                order={1}
                style={{
                  color: "#1a365d",
                  fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                }}
              >
                {title}
              </Title>
            )}
            {subtitle && (
              <Text c="dimmed" size="lg" maw={600}>
                {subtitle}
              </Text>
            )}
          </Stack>
        )}
        {children}
      </Container>
    </Box>
  );
}
