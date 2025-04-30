"use client";

import React, { useState, useTransition } from "react";
import { Button, Text, Box } from "@mantine/core"; // Use Mantine
import { IconDownload } from "@tabler/icons-react"; // Use Tabler icon
import { downloadMileageLogXls } from "@/app/actions/downloadMileageLogXls";
import { useMediaQuery } from "@mantine/hooks";

interface GenerateXlsProps {
  logId: string;
  filename?: string; // Optional custom filename prefix
}

// Helper function to trigger browser download
const triggerDownload = (base64Data: string, filename: string) => {
  try {
    // Decode base64
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // Create Blob
    const blob = new Blob([byteArray], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();

    // Clean up
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to trigger download:", error);
    alert("Failed to prepare the file for download.");
  }
};

export function GenerateXls({
  logId,
  filename = "mileage-log",
}: GenerateXlsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleDownload = () => {
    setError(null); // Clear previous errors
    startTransition(async () => {
      try {
        const result = await downloadMileageLogXls(logId);
        if (result.success && result.data) {
          const downloadFilename = `${filename}-${logId}.xlsx`;
          triggerDownload(result.data, downloadFilename);
        } else {
          console.error("Failed to generate XLS:", result.error);
          setError(result.error || "An unknown error occurred.");
          // Optionally show error to user via alert or snackbar
          alert(
            `Error generating Excel file: ${result.error || "Unknown error"}`
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        console.error("Error calling download action:", err);
        setError(errorMessage);
        alert(`Error: ${errorMessage || "Could not connect to server."}`);
      }
    });
  };

  return (
    <Box>
      <Button
        variant="subtle" // Mantine variant
        loaderProps={{ type: "dots" }}
        leftSection={<IconDownload size={16} />}
        onClick={handleDownload}
        loading={isPending} // Use Mantine loading prop
        disabled={isPending}
        size={isMobile ? "md" : "sm"}
      >
        {isPending ? "Generating..." : "Download XLS"}
      </Button>
      {error && (
        <Text c="red" size="sm" mt="xs">
          Error: {error}
        </Text>
      )}
    </Box>
  );
}
