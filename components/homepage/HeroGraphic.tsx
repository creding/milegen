import {
  Box,
  Button,
  Card,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Badge,
  RingProgress,
  Center,
} from "@mantine/core";
import {
  IconCar,
  IconCalendar,
  IconMapPin,
  IconFileText,
  IconCheck,
  IconDownload,
  IconTrendingUp,
} from "@tabler/icons-react";

export function HeroGraphic() {
  return (
    <Box
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "600px",
        height: "450px",
        perspective: "1000px",
      }}
    >
      {/* Background Glow */}
      <Box
        style={{
          position: "absolute",
          top: "10%",
          left: "10%",
          right: "10%",
          bottom: "10%",
          background:
            "radial-gradient(circle, rgba(49, 151, 149, 0.4) 0%, transparent 70%)",
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />

      {/* Main Interface Card (The App) */}
      <Paper
        radius="lg"
        shadow="xl"
        style={{
          position: "absolute",
          top: "40px",
          left: "0",
          right: "40px",
          bottom: "40px",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          transform: "rotateY(-5deg) rotateX(2deg)",
          zIndex: 2,
          overflow: "hidden",
        }}
      >
        {/* Window controls */}
        <Group
          px="md"
          py="xs"
          style={{ borderBottom: "1px solid #e2e8f0" }}
          bg="gray.0"
        >
          <Group gap={6}>
            <Box
              w={10}
              h={10}
              style={{ borderRadius: "50%", background: "#feb2b2" }}
            />
            <Box
              w={10}
              h={10}
              style={{ borderRadius: "50%", background: "#fbd38d" }}
            />
            <Box
              w={10}
              h={10}
              style={{ borderRadius: "50%", background: "#9ae6b4" }}
            />
          </Group>
          <Text size="xs" c="dimmed" mx="auto" fw={500}>
            MileGen Dashboard
          </Text>
          <Box w={40} /> {/* Spacer for centering */}
        </Group>

        <Group align="stretch" h="100%" gap={0}>
          {/* Sidebar */}
          <Stack
            w={60}
            bg="gray.0"
            align="center"
            py="md"
            gap="lg"
            style={{ borderRight: "1px solid #e2e8f0" }}
          >
            <ThemeIcon variant="transparent" color="teal">
              <IconCar size={24} />
            </ThemeIcon>
            <ThemeIcon variant="transparent" color="gray">
              <IconFileText size={24} />
            </ThemeIcon>
          </Stack>

          {/* Main Content */}
          <Stack p="lg" style={{ flex: 1 }} gap="lg">
            <div>
              <Text size="lg" fw={700} c="gray.8">
                New Mileage Log
              </Text>
              <Text size="xs" c="dimmed">
                Generate your IRS-compliant report
              </Text>
            </div>

            {/* Form Fields Simulation */}
            <Stack gap="sm">
              <Group grow>
                <Box>
                  <Text size="xs" fw={500} c="gray.6" mb={4}>
                    Odometer Start
                  </Text>
                  <Paper withBorder p="xs" bg="gray.0">
                    <Text size="sm" c="gray.7">
                      14,250
                    </Text>
                  </Paper>
                </Box>
                <Box>
                  <Text size="xs" fw={500} c="gray.6" mb={4}>
                    Odometer End
                  </Text>
                  <Paper withBorder p="xs" bg="gray.0">
                    <Text size="sm" c="gray.7">
                      28,500
                    </Text>
                  </Paper>
                </Box>
              </Group>

              <Box>
                <Text size="xs" fw={500} c="gray.6" mb={4}>
                  Date Range
                </Text>
                <Paper withBorder p="xs" bg="gray.0">
                  <Group justify="space-between">
                    <Text size="sm" c="gray.7">
                      Jan 1, 2024 - Dec 31, 2024
                    </Text>
                    <IconCalendar size={14} color="gray" />
                  </Group>
                </Paper>
              </Box>

              <Card
                bg="teal.0"
                radius="md"
                mt="xs"
                p="sm"
                style={{ border: "1px solid #b2f5ea" }}
              >
                <Group>
                  <ThemeIcon color="teal" variant="light" radius="xl">
                    <IconCheck size={16} />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" fw={700} c="teal.9">
                      Ready to Generate
                    </Text>
                    <Text size="xs" c="teal.7">
                      12,450 business miles detected
                    </Text>
                  </div>
                </Group>
              </Card>

              <Button fullWidth color="teal" radius="md" mt="auto">
                Generate Log
              </Button>
            </Stack>
          </Stack>
        </Group>
      </Paper>

      {/* Floating Elements (The "Compelling" Parts) */}

      {/* Stats Card */}
      <Paper
        shadow="xl"
        radius="md"
        p="md"
        style={{
          position: "absolute",
          top: "20px",
          right: "0",
          width: "200px",
          background: "white",
          zIndex: 3,
          transform: "rotate(3deg)",
          border: "1px solid #e2e8f0",
        }}
      >
        <Group gap="xs" mb="xs">
          <ThemeIcon color="blue" variant="light" size="sm">
            <IconTrendingUp size={14} />
          </ThemeIcon>
          <Text size="xs" fw={700} c="gray.6" tt="uppercase">
            Tax Savings
          </Text>
        </Group>
        <Text size="xl" fw={800} c="gray.8">
          $8,715.00
        </Text>
        <Badge size="xs" color="green" variant="light" mt={4}>
          +24% vs last year
        </Badge>
      </Paper>

      {/* Download Card */}
      <Paper
        shadow="lg"
        radius="md"
        p="sm"
        style={{
          position: "absolute",
          bottom: "80px",
          left: "-20px",
          background: "white",
          zIndex: 3,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          transform: "rotate(-3deg)",
          border: "1px solid #e2e8f0",
        }}
      >
        <ThemeIcon size="lg" color="red" variant="light">
          <IconFileText size={20} />
        </ThemeIcon>
        <div>
          <Text size="sm" fw={600}>
            2024_Log.pdf
          </Text>
          <Group gap={4}>
            <IconCheck size={10} color="green" />
            <Text size="xs" c="dimmed">
              IRS Compliant
            </Text>
          </Group>
        </div>
        <ThemeIcon variant="subtle" color="gray" size="sm" ml="xs">
          <IconDownload size={16} />
        </ThemeIcon>
      </Paper>
    </Box>
  );
}
