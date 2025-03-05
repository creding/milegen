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
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { loginAction } from "@/app/actions/login";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconAlertCircle } from "@tabler/icons-react";

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
      radius="md"
      centered
      shadow="sm"
      opened={true}
      onClose={() => router.push("/")}
      transitionProps={{
        transition: "fade-up",
        timingFunction: "linear",
      }}
      size="lg"
    >
      <ModalOverlay />
      <ModalContent p="md" radius="md">
        <Group justify="space-between">
          <ModalTitle>Login</ModalTitle>
          <ModalCloseButton />
        </Group>
        <ModalBody>
          <Stack py="xl">
            {error && (
              <Alert
                icon={<IconAlertCircle size="1rem" />}
                title="Login Failed"
                color="red"
                mb="md"
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
              <Stack>
                <TextInput
                  label="Email"
                  name="email"
                  type="email"
                  required
                  {...form.getInputProps("email")}
                />
                <PasswordInput
                  label="Password"
                  name="password"
                  required
                  {...form.getInputProps("password")}
                />
                <Button
                  type="submit"
                  fullWidth
                  style={{
                    background: "linear-gradient(to right, #3498db, #39c0ba)",
                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
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
