import {
  Box,
  Container,
  Group,
  Paper,
  SimpleGrid,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconQuote, IconUser } from "@tabler/icons-react";

export function TestimonialsSection() {
  // Testimonials
  const testimonials = [
    {
      quote:
        "Milegen saved me during my IRS audit. The logs were accepted without question, and I was able to claim my full deduction.",
      author: "Michael R., Small Business Owner",
    },
    {
      quote:
        "As a sales representative, I drive constantly but never had time to track my miles. Milegen helped me recover thousands in deductions I would have otherwise lost.",
      author: "Sarah T., Sales Professional",
    },
    {
      quote:
        "The interface is so intuitive. I was able to create a full year's worth of mileage logs in under 10 minutes. Incredible time-saver!",
      author: "David L., Real Estate Agent",
    },
  ];

  return (
    <Box
      py={80}
      style={{
        background: "linear-gradient(to right, #3498db, #39c0ba)",
        borderTop: "1px solid rgba(0, 0, 0, 0.05)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
      }}
    >
      <Container size="lg">
        <Title order={2} ta="center" mb="xs" style={{ color: "#3498db" }}>
          WHAT OUR USERS SAY
        </Title>
        <Text c="dimmed" ta="center" maw={700} size="lg" mb={50} mx="auto">
          Thousands of professionals trust MileGen for their mileage tracking
          needs
        </Text>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
          {testimonials.map((testimonial, index) => (
            <Paper
              key={index}
              p="xl"
              radius="md"
              withBorder
              style={{
                backgroundColor: "white",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                position: "relative",
                overflow: "hidden",
              }}
              className="hover-card"
            >
              <ThemeIcon
                size={40}
                radius="xl"
                style={{
                  background: "linear-gradient(to right, #3498db, #39c0ba)",
                  position: "absolute",
                  top: -20,
                  right: -20,
                  opacity: 0.1,
                  transform: "scale(2.5)",
                }}
              >
                <IconQuote size="1.5rem" />
              </ThemeIcon>

              <Text
                size="lg"
                style={{ fontStyle: "italic", flexGrow: 1 }}
                mb="xl"
              >
                &quot;{testimonial.quote}&quot;
              </Text>

              <Group>
                <ThemeIcon
                  size={40}
                  radius="xl"
                  style={{
                    background: "linear-gradient(to right, #3498db, #39c0ba)",
                  }}
                >
                  <IconUser size="1.5rem" />
                </ThemeIcon>
                <Text fw={600}>{testimonial.author}</Text>
              </Group>
            </Paper>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
