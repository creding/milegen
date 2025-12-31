import {
  Box,
  Container,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Rating,
  Badge,
} from "@mantine/core";
import { IconUser } from "@tabler/icons-react";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "MileGen saved me during my IRS audit. The logs were accepted without question, and I was able to claim my full deduction. Worth every penny!",
    author: "Michael R.",
    role: "Small Business Owner",
    rating: 5,
  },
  {
    quote:
      "As a sales rep, I drive 500+ miles per week but never had time to track them. MileGen helped me recover over $3,000 in deductions I would have lost.",
    author: "Sarah T.",
    role: "Sales Professional",
    rating: 5,
  },
  {
    quote:
      "The interface is incredibly intuitive. I created a full year's worth of mileage logs in under 10 minutes. This is exactly what busy professionals need.",
    author: "David L.",
    role: "Real Estate Agent",
    rating: 5,
  },
  {
    quote:
      "I was skeptical at first, but MileGen delivered exactly what it promised. Clean, professional logs that my accountant actually complimented me on.",
    author: "Jennifer K.",
    role: "Independent Contractor",
    rating: 5,
  },
  {
    quote:
      "After years of using expensive apps that charge monthly, finding MileGen was a game-changer. One annual fee for unlimited logs? Sign me up!",
    author: "Robert M.",
    role: "Rideshare Driver",
    rating: 5,
  },
  {
    quote:
      "My CPA recommended I get better documentation for my mileage. MileGen made it simple to create professional logs that hold up to scrutiny.",
    author: "Lisa P.",
    role: "Home Health Nurse",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <Box
      py={80}
      style={{
        background: "linear-gradient(135deg, #1a365d 0%, #2d3748 100%)",
      }}
    >
      <Container size="xl">
        <Stack align="center" gap="xs" mb={50}>
          <Badge
            size="lg"
            variant="gradient"
            gradient={{ from: "teal", to: "cyan" }}
            mb="sm"
          >
            Trusted by Thousands
          </Badge>
          <Title order={2} ta="center" c="white">
            What Our Users Say
          </Title>
          <Text c="gray.4" ta="center" maw={600} size="lg">
            Join thousands of professionals who trust MileGen for their mileage
            documentation
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
          {testimonials.map((testimonial, index) => (
            <Paper
              key={index}
              p="xl"
              radius="lg"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <Stack gap="md" style={{ flex: 1 }}>
                {/* Rating */}
                <Rating value={testimonial.rating} readOnly color="yellow" />

                {/* Quote */}
                <Text
                  size="md"
                  c="gray.2"
                  style={{ fontStyle: "italic", flex: 1 }}
                >
                  &ldquo;{testimonial.quote}&rdquo;
                </Text>

                {/* Author */}
                <Group mt="auto">
                  <ThemeIcon
                    size={44}
                    radius="xl"
                    variant="gradient"
                    gradient={{ from: "teal", to: "cyan" }}
                  >
                    <IconUser size={24} />
                  </ThemeIcon>
                  <div>
                    <Text fw={600} c="white">
                      {testimonial.author}
                    </Text>
                    <Text size="sm" c="gray.4">
                      {testimonial.role}
                    </Text>
                  </div>
                </Group>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
