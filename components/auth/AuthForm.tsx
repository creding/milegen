"use client";

import { useState } from "react";
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Anchor,
  Stack,
  Divider,
  Group,
  Alert,
  Checkbox, // Import Checkbox
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconInfoCircle } from "@tabler/icons-react"; // Import IconInfoCircle
import { getURL } from "@/utils/getUrl";
import { createClient } from "@/lib/supabaseBrowserClient";

import { GoogleLoginButton } from "@/components/ui/google/GoogleLoginButton";
import { loginAction, signUpAction } from "@/app/actions/login";

export default function AuthForm({ redirectPath }: { redirectPath: string }) {
  const [error, setError] = useState<string | null>(null);
  const [signupMessage, setSignupMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const supabase = createClient();
  const url = getURL();
  const redirectTo = `${url}/auth/callback?redirect=${encodeURIComponent(
    redirectPath
  )}`;
  console.log("redirectTo", redirectTo);
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false, // Add termsAccepted field
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (mode === "signup") {
        if (!values.email) {
          errors.email = "Email is required";
        }
        if (!values.password) {
          errors.password = "Password is required";
        }
        if (values.password !== values.confirmPassword) {
          errors.confirmPassword = "Passwords do not match";
        }
        if (!values.termsAccepted) {
          // Validate terms only on signup
          errors.termsAccepted = "You must accept the terms and conditions";
        }
      } else {
        if (!values.email) {
          errors.email = "Email is required";
        }
        if (!values.password) {
          errors.password = "Password is required";
        }
      }
      return errors;
    },
  });

  const handleEmailAuth = async (formData: FormData) => {
    setLoading(true);
    setError("");
    setSignupMessage(""); // Clear previous messages

    try {
      if (mode === "signin") {
        const { error } = await loginAction(formData);
        if (error) {
          setError(error.message);
        }
      } else {
        // Sign up mode - Construct the object signUpAction expects
        const signupData = {
          email: form.values.email,
          password: form.values.password,
          // termsAccepted is already a boolean in form.values
          termsAccepted: form.values.termsAccepted,
        };
        // Pass the constructed object instead of formData
        const { error } = await signUpAction(signupData);
        if (error) throw error;
        // --- NEW --- Show success message instead of redirecting
        setSignupMessage(
          "Check your email for the confirmation link to complete sign up."
        );
      }
    } catch (err) {
      if (err instanceof Error && err.message !== "NEXT_REDIRECT") {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError("");
    setSignupMessage(""); // Clear previous messages

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) throw error;
      // No router.push needed here, Supabase handles redirect via Google
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset messages when mode changes
  const handleModeChange = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setError("");
    setSignupMessage("");
  };

  const handleSubmit = (values: typeof form.values) => {
    // Create FormData manually to ensure correct field names for server actions
    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("password", values.password);
    // Only append confirmPassword and termsAccepted for signup
    if (mode === "signup") {
      formData.append("confirmPassword", values.confirmPassword);
      formData.append("termsAccepted", String(values.termsAccepted)); // Send as string
    }
    handleEmailAuth(formData);
  };

  return (
    <Paper p="xl" withBorder>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Title order={4} ta="center">
            {mode === "signin"
              ? "Sign in to your account"
              : "Create an account"}
          </Title>

          {/* Display Error Message */}
          {error &&
            !form.errors.termsAccepted && ( // Don't show general error if it's just the terms checkbox error
              <Alert
                variant="light"
                color="red"
                title="Authentication Error"
                icon={<IconInfoCircle />} // Use an appropriate icon
                withCloseButton
                onClose={() => setError("")} // Allow closing
              >
                {error}
              </Alert>
            )}

          {/* Display Signup Success Message */}
          {signupMessage && (
            <Alert
              variant="light"
              color="teal" // Use a success color
              title="Sign Up Successful"
              icon={<IconInfoCircle />}
              withCloseButton
              onClose={() => setSignupMessage("")}
            >
              {signupMessage}
            </Alert>
          )}

          {/* Hide form fields if sign up was successful */}
          {!signupMessage && (
            <>
              <TextInput
                required
                label="Email address"
                placeholder="your@email.com"
                {...form.getInputProps("email")}
                disabled={loading}
              />

              <PasswordInput
                required
                label="Password"
                placeholder="Your password"
                {...form.getInputProps("password")}
                disabled={loading}
                // Suggestion: Add description for password requirements if any
                // description="Password must be at least 6 characters long"
              />

              {mode === "signup" && (
                <PasswordInput
                  required
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  {...form.getInputProps("confirmPassword")}
                  disabled={loading}
                />
              )}

              {/* Terms Accepted Checkbox */}
              {mode === "signup" && (
                <Checkbox
                  mt="md"
                  label={
                    <>
                      I accept the{" "}
                      <Anchor href="/terms" target="_blank" size="sm">
                        Terms and Conditions
                      </Anchor>
                    </>
                  }
                  {...form.getInputProps("termsAccepted", { type: "checkbox" })}
                  error={form.errors.termsAccepted} // Display validation error specific to checkbox
                />
              )}

              <Button
                type="submit"
                loading={loading}
                fullWidth // Consider fullWidth for main action
              >
                {mode === "signin" ? "Sign in" : "Sign up"}
              </Button>

              <Divider
                label="Or continue with"
                labelPosition="center"
                my="sm"
              />

              <GoogleLoginButton
                onClick={handleGoogleAuth}
                disabled={loading}
                fullWidth
                variant="outline"
              />
            </>
          )}

          {/* Mode Toggle - Conditionally render or adjust text */}
          {!signupMessage && ( // Hide toggle if showing success message
            <Group justify="center" gap={5} mt="sm">
              <Text size="sm">
                {mode === "signin"
                  ? "Don't have an account?"
                  : "Already have an account?"}
              </Text>
              <Anchor
                size="sm"
                component="button"
                type="button"
                onClick={handleModeChange} // Use updated handler
                disabled={loading}
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </Anchor>
            </Group>
          )}
        </Stack>
      </form>
    </Paper>
  );
}
