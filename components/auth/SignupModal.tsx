"use client";

import {
  Text,
  TextInput,
  PasswordInput,
  Stack,
  Button,
  Checkbox,
  Group,
  Anchor,
  Alert,
  ModalRoot,
  ModalBody,
  ModalContent,
  ModalOverlay,
  ModalCloseButton,
  Center,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import Link from "next/link";
import { useState } from "react";
import { signUpAction } from "@/app/actions/login";
import { IconAlertCircle, IconLock, IconMail } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/layout/Logo";

export function SignupModal() {
  const router = useRouter();
  const [termsAccepted, setTermsAccepted] = useState(false);
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
        value.length < 6 ? "Password must be at least 6 characters" : null,
    },
  });

  const handleSubmit = async (formData: FormData) => {
    setError(null);

    if (!termsAccepted) {
      setError("terms");
      return;
    }

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signUpAction({
        email,
        password,
        termsAccepted,
      });
      router.push("/?login=true");
    } catch (error) {
      console.error("Signup error:", error);
      setError("auth");
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
                  Create Account
                </Text>
                <Text c="dimmed" size="sm" ta="center">
                  Join thousands of professionals regenerating mileage logs
                </Text>
              </Stack>
            </Center>

            {error === "terms" && (
              <Alert
                icon={<IconAlertCircle size="1rem" />}
                title="Terms Required"
                color="red"
                variant="light"
                radius="md"
              >
                You must accept the Terms of Service.
              </Alert>
            )}

            {error === "auth" && (
              <Alert
                icon={<IconAlertCircle size="1rem" />}
                title="Sign Up Failed"
                color="red"
                variant="light"
                radius="md"
              >
                There was a problem creating your account.
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

                <Checkbox
                  mt="xs"
                  label={
                    <Group gap={5} wrap="nowrap">
                      <Text size="sm">I agree to the</Text>
                      <Link href="/terms" target="_blank">
                        <Anchor size="sm" component="span" c="blue">
                          Terms of Service
                        </Anchor>
                      </Link>
                    </Group>
                  }
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.currentTarget.checked)}
                />

                <Button
                  type="submit"
                  fullWidth
                  size="md"
                  radius="xl"
                  fw={600}
                  mt="xs"
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
                  Get Started
                </Button>
              </Stack>
            </form>
          </Stack>
        </ModalBody>
      </ModalContent>
    </ModalRoot>
  );
}
