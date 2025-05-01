"use client";

import { useState, useTransition } from "react";
import { Button, Loader, Text, Modal, Stack } from "@mantine/core";
import { IconFileDownload } from "@tabler/icons-react";
import { downloadMileageLogPdf } from "@/app/actions/downloadMileageLogPdf";
import { useMediaQuery } from "@mantine/hooks";

interface GeneratePDFProps {
  log: { id: string };
}

const triggerDownload = (base64Data: string, filename: string) => {
  try {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to trigger download:", error);
    alert("Failed to prepare the file for download.");
  }
};

export function GeneratePDF({ log }: GeneratePDFProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleDownload = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await downloadMileageLogPdf(log.id);
        if (result.success && result.data) {
          const downloadFilename = `mileage-log-${log.id}.pdf`;
          triggerDownload(result.data, downloadFilename);
        } else {
          console.error("Failed to generate PDF:", result.error);
          setError(result.error || "An unknown error occurred.");
          alert(
            `Error generating PDF file: ${result.error || "Unknown error"}`
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        console.error("Error calling PDF download action:", err);
        setError(errorMessage);
        alert(`Error: ${errorMessage || "Could not connect to server."}`);
      }
    });
  };

  return (
    <>
      <Button
        variant="subtle"
        size={isMobile ? "md" : "sm"}
        loaderProps={{ type: "dots" }}
        leftSection={<IconFileDownload size={16} />}
        onClick={handleDownload}
        loading={isPending}
        disabled={isPending}
      >
        {isPending ? "Generating..." : "Download PDF"}
      </Button>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        size="90%"
        title="Mileage Log PDF Preview"
      >
        <Stack align="center" gap="md">
          {error ? (
            <Text c="red" size="sm">
              Error: {error}
            </Text>
          ) : (
            <Text c="dimmed" size="sm">
              Click the button below to download your mileage log as a PDF
            </Text>
          )}
          <Button
            variant="gradient"
            gradient={{ from: "blue", to: "cyan" }}
            leftSection={
              isPending ? <Loader size="xs" /> : <IconFileDownload size={16} />
            }
            onClick={handleDownload}
            loading={isPending}
            disabled={isPending}
          >
            {isPending ? "Generating..." : "Download PDF"}
          </Button>
        </Stack>
      </Modal>
    </>
  );
}
