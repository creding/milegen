import { Card, Text, Button, Stack, List, rem } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

interface PriceCardProps {
  price: string;
  period: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  footerText: string;
}

export function PriceCard({
  price,
  period,
  features,
  ctaText,
  ctaLink,
  footerText,
}: PriceCardProps) {
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(8px)",
      }}
    >
      <Stack gap="md">
        <div style={{ marginBottom: rem(8) }}>
          <Text size="xl" fw={700} style={{ color: "#228BE6" }}>
            {price}
          </Text>
          <Text size="sm" c="dimmed" style={{ marginTop: rem(-4) }}>
            {period}
          </Text>
        </div>

        <List
          spacing="xs"
          size="sm"
          center
          icon={
            <IconCheck
              style={{ width: rem(14), height: rem(14) }}
              color="#228BE6"
              stroke={1.5}
            />
          }
        >
          {features.map((feature, index) => (
            <List.Item key={index}>{feature}</List.Item>
          ))}
        </List>

        <Button
          variant="filled"
          color="blue"
          size="lg"
          radius="md"
          fullWidth
          component="a"
          href={ctaLink}
          style={{ marginTop: rem(16) }}
        >
          {ctaText}
        </Button>

        <Text size="xs" ta="center" c="dimmed" mt="sm">
          {footerText}
        </Text>
      </Stack>
    </Card>
  );
}
