"use server";

import { createClient } from "@/lib/supabaseServerClient";
import type { MileageLog } from "@/types/mileage";

export async function loadMileageLogs(): Promise<{
  logs: MileageLog[];
  success: boolean;
  message: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    if (!user) {
      throw new Error("User is not logged in");
    }

    const { data, error } = await supabase
      .from("mileage_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      logs: data || [],
      success: true,
      message: "Mileage logs loaded successfully",
    };
  } catch (error) {
    console.error("Error loading mileage logs:", error);
    return {
      logs: [],
      success: false,
      message: "Failed to load mileage logs. Please try again.",
    };
  }
}

export async function loadMileageLog(
  logId: string
): Promise<{
  log: MileageLog | null;
  success: boolean;
  message: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    if (!user) {
      throw new Error("User is not logged in");
    }

    const { data, error } = await supabase
      .from("mileage_logs")
      .select("*")
      .eq("id", logId)
      .eq("user_id", user.id)
      .single();

    if (error) throw error;

    return {
      log: data,
      success: true,
      message: "Mileage log loaded successfully",
    };
  } catch (error) {
    console.error("Error loading mileage log:", error);
    return {
      log: null,
      success: false,
      message: "Failed to load mileage log. Please try again.",
    };
  }
}
