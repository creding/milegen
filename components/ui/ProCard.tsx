import { Paper, PaperProps } from "@mantine/core";

interface ProCardProps extends PaperProps {
  children: React.ReactNode;
}

export function ProCard({ children, style, ...props }: ProCardProps) {
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
      {children}
    </Paper>
  );
}
