"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabaseServerClient";

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

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return {
      error: { message: "There was an error logging in.", code: error.message },
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

  // Ensure terms are accepted
  if (termsAccepted !== true) {
    return { error: "Terms of Service must be accepted" };
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
    console.error("Failed to create user:", authError);
    return { error: "Failed to create user." };
  }

  revalidatePath("/");
  redirect("/generator");
}
