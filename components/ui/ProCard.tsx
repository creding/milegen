import { Paper, PaperProps, Text, Group } from "@mantine/core";

interface ProCardProps extends PaperProps {
  children: React.ReactNode;
  title?: string;
}

export function ProCard({ children, title, style, ...props }: ProCardProps) {
  return (
    <Paper
      p="xl"
      radius="lg"
      withBorder
      shadow="sm"
      style={{
        borderColor: "#e2e8f0",
        backgroundColor: "#ffffff",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        ...style,
      }}
      {...props}
    >
      {title && (
        <Group mb="md">
          <Text fw={700} size="lg">
            {title}
          </Text>
        </Group>
      )}
      {children}
    </Paper>
  );
}
