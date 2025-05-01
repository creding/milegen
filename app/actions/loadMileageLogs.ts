"use server";

import { createClient } from "@/lib/supabaseServerClient";
import type { Tables } from "@/types/database.types";
import { z } from "zod";
import { logger } from "@/lib/logger"; 
import {
  fetchAllMileageLogsByUserId,
  fetchMileageLogById,
} from "@/lib/data/mileage"; 

const idSchema = z.string().uuid("Invalid log ID");

type MileageLog = Tables<'mileage_logs'>;

export async function loadMileageLogs(): Promise<{
  logs: MileageLog[];
  success: boolean;
  message: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError, 
  } = await supabase.auth.getUser();

  if (authError || !user) {
    logger.warn({ err: authError }, "Load mileage logs action called without authenticated user.");
    return {
      logs: [],
      success: false,
      message: "Authentication required to load mileage logs.",
    };
  }

  const { data, error } = await fetchAllMileageLogsByUserId(supabase, user.id);

  if (error) {
    return {
      logs: [],
      success: false,
      message: "Failed to load mileage logs. Please try again.",
    };
  }

  return {
    logs: data || [],
    success: true,
    message: "Mileage logs loaded successfully",
  };
}

export async function loadMileageLog(
  logId: string
): Promise<{
  log: MileageLog | null;
  success: boolean;
  message: string;
}> {
  const parsed = idSchema.safeParse(logId);
  if (!parsed.success) {
    const validationMessage = `Validation error: ${parsed.error.errors.map(e => e.message).join(", ")}`;
    logger.warn({ logId, error: validationMessage }, "Invalid log ID format provided to loadMileageLog action.");
    return { log: null, success: false, message: validationMessage };
  }
  const validLogId = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    logger.warn({ err: authError, logId: validLogId }, "Load single mileage log action called without authenticated user.");
    return {
      log: null,
      success: false,
      message: "Authentication required to load mileage log.",
    };
  }

  const { data, error } = await fetchMileageLogById(supabase, user.id, validLogId);

  if (error) {
    // Error (if not 404) is already logged in the data layer function
    // Check if error has a 'code' property before accessing it
    const isNotFoundError = error instanceof Object && 'code' in error && error.code === 'PGRST116';
    const userMessage = error.message.includes('result requires exactly one row') || isNotFoundError
      ? "Mileage log not found or access denied."
      : "Failed to load mileage log. Please try again.";
    return {
      log: null,
      success: false,
      message: userMessage,
    };
  }

  if (!data) {
      logger.error({ userId: user.id, logId: validLogId }, "Data layer returned success but null data for single log fetch.");
      return {
        log: null,
        success: false,
        message: "An unexpected error occurred loading the log.",
      };
  }

  return {
    log: data,
    success: true,
    message: "Mileage log loaded successfully",
  };
}
