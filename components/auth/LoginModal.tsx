"use client";

import {
  Group,
  TextInput,
  PasswordInput,
  Stack,
  Button,
  ModalRoot,
  ModalContent,
  ModalOverlay,
  ModalTitle,
  ModalCloseButton,
  ModalBody,
  Alert,
  Text,
  Center,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { loginAction } from "@/app/actions/login";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconAlertCircle, IconLock, IconMail } from "@tabler/icons-react";
import { Logo } from "@/components/layout/Logo";

export function LoginModal() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value: string) =>
        /^\S+@\S+$/.test(value) ? null : "Invalid email",
      password: (value: string) =>
        value.length < 1 ? "Password is required" : null,
    },
  });

  const handleSubmit = async (formData: FormData) => {
    setError(null);

    try {
      const { error } = await loginAction(formData);
      if (error) {
        setError(error.code);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <ModalRoot
      radius="lg"
      centered
      shadow="xl"
      opened={true}
      onClose={() => router.push("/")}
      transitionProps={{
        transition: "fade-up",
        timingFunction: "ease",
        duration: 300,
      }}
      size="md"
    >
      <ModalOverlay blur={3} backgroundOpacity={0.55} />
      <ModalContent p="lg" radius="lg">
        <Group justify="flex-end">
          <ModalCloseButton />
        </Group>
        <ModalBody>
          <Stack gap="lg" pb="lg">
            <Center>
              <Stack gap="xs" align="center">
                <Logo />
                <Text size="xl" fw={700} mt="md">
                  Welcome Back
                </Text>
                <Text c="dimmed" size="sm">
                  Sign in to manage your mileage logs
                </Text>
              </Stack>
            </Center>

            {error && (
              <Alert
                icon={<IconAlertCircle size="1rem" />}
                title="Login Failed"
                color="red"
                variant="light"
                radius="md"
              >
                {error}
              </Alert>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSubmit(formData);
              }}
            >
              <Stack gap="md">
                <TextInput
                  placeholder="Email"
                  name="email"
                  type="email"
                  required
                  variant="filled"
                  radius="md"
                  size="md"
                  leftSection={<IconMail size={18} stroke={1.5} />}
                  {...form.getInputProps("email")}
                />
                <PasswordInput
                  placeholder="Password"
                  name="password"
                  required
                  variant="filled"
                  radius="md"
                  size="md"
                  leftSection={<IconLock size={18} stroke={1.5} />}
                  {...form.getInputProps("password")}
                />
                <Button
                  type="submit"
                  fullWidth
                  size="md"
                  radius="xl"
                  fw={600}
                  style={{
                    background: "linear-gradient(to right, #3498db, #39c0ba)",
                    boxShadow: "0 4px 14px rgba(52, 152, 219, 0.3)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 20px rgba(52, 152, 219, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 14px rgba(52, 152, 219, 0.3)";
                  }}
                >
                  Log In
                </Button>
              </Stack>
            </form>
          </Stack>
        </ModalBody>
      </ModalContent>
    </ModalRoot>
  );
}
