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
  ModalTitle,
  ModalRoot,
  ModalBody,
  ModalContent,
  ModalOverlay,
  ModalCloseButton,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import Link from "next/link";
import { useState } from "react";
import { signUpAction } from "@/app/actions/login";
import { IconAlertCircle } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

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

    // Add the terms accepted state to the form data
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
          <ModalTitle>Sign Up</ModalTitle>
          <ModalCloseButton />
        </Group>
        <ModalBody>
          <Stack py="xl">
            {error === "terms" && (
              <Alert
                icon={<IconAlertCircle size="1rem" />}
                title="Terms Required"
                color="red"
                mb="md"
              >
                You must accept the Terms of Service to create an account.
              </Alert>
            )}

            {error === "auth" && (
              <Alert
                icon={<IconAlertCircle size="1rem" />}
                title="Sign Up Failed"
                color="red"
                mb="md"
              >
                There was a problem creating your account. Please try again.
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
                <Checkbox
                  label={
                    <Group gap={5} wrap="nowrap">
                      <Text size="sm">I agree to the</Text>
                      <Link href="/terms" target="_blank">
                        <Anchor size="sm" component="span">
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
                  style={{
                    background: "linear-gradient(to right, #3498db, #39c0ba)",
                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  Sign Up
                </Button>
              </Stack>
            </form>
          </Stack>
        </ModalBody>
      </ModalContent>
    </ModalRoot>
  );
}
