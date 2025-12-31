import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Manually parse .env.local
const envPath = path.join(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const envVars: Record<string, string> = {};

envContent.split("\n").forEach((line) => {
  const [key, ...valueParts] = line.split("=");
  if (key && valueParts.length > 0) {
    let value = valueParts.join("=");
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const supabaseKey =
  envVars["SUPABASE_SERVICE_ROLE_KEY"] ||
  envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadFile() {
  const filePath = path.join(
    process.cwd(),
    "public/pdf/mileage-log-2024-01-01-2024-12-31.pdf"
  );

  if (!fs.existsSync(filePath)) {
    console.error(`File not found at: ${filePath}`);
    process.exit(1);
  }

  const fileBuffer = fs.readFileSync(filePath);
  const fileName = "sample-mileage-log.pdf";
  const bucketName = "public"; // Assumes 'public' bucket exists, change if needed (e.g., 'documents')

  console.log(`Uploading ${fileName} to bucket '${bucketName}'...`);

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, fileBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) {
    console.error("Upload failed:", error);
    process.exit(1);
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  console.log("Upload successful!");
  console.log("Public URL:", publicUrlData.publicUrl);
}

uploadFile();
