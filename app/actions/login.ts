"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabaseServerClient";
import { logger } from "@/lib/logger";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "Terms of Service must be accepted" }),
  }),
});

export async function logoutAction() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
  revalidatePath("/");
  redirect("/login");
}

export async function loginAction(formData: FormData) {
  const supabase = await createClient();

  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join(", ");
    return { success: false, error: { message: `Validation error: ${msg}` } };
  }
  const data = parsed.data;

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return {
      success: false,
      error: {
        message: "There was an error logging in.",
        code: error.message,
      },
    };
  }

  revalidatePath("/");
  redirect("/generator");
}

export async function signUpAction({
  email,
  password,
  termsAccepted,
}: {
  email: string;
  password: string;
  termsAccepted: boolean;
}) {
  const supabase = await createClient();

  // validate inputs
  const signUpParse = signUpSchema.safeParse({
    email,
    password,
    termsAccepted,
  });
  if (!signUpParse.success) {
    const msg = signUpParse.error.errors.map((e) => e.message).join(", ");
    return { error: msg };
  }

  const termsAcceptedAt = new Date().toISOString();
  const currentTermsVersion = "1.0"; // You might want to store this in an env variable or config

  // Create the auth user with terms acceptance metadata
  const { error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        terms_accepted: true,
        terms_accepted_at: termsAcceptedAt,
        terms_version: currentTermsVersion,
      },
    },
  });

  if (authError) {
    logger.error({ err: authError }, "Failed to create user");
    return { error: "Failed to create user." };
  }

  revalidatePath("/");
  redirect("/generator");
}
