"use client";

import { useReducer, useRef, useState } from "react";
import { notifications } from "@mantine/notifications";
import { saveMileageLog as saveMileageLogApi } from "@/app/actions/saveMileageLog";
import type { MileageLog } from "@/app/actions/mileageGenerator";
import { MileageLogDisplay } from "@/components/milagelog/MileageLogDisplay";
import { PrintMilageLog } from "@/components/milagelog/PrintMilageLog";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  IconCheck,
  IconDeviceFloppy,
  IconX,
  IconRefresh,
  IconFileDownload,
} from "@tabler/icons-react";
import {
  Button,
  Card,
  Container,
  Group,
  Title,
  Stack,
  Text,
  LoadingOverlay,
} from "@mantine/core";
import { MileageForm } from "@/components/milagelog/MileageForm";
import { User } from "@supabase/supabase-js";
import { useMediaQuery } from "@mantine/hooks";
import { generateMileageLogFromForm } from "@/app/actions/mileageGenerator";

export const GeneratorPage = ({
  user,
  subscriptionStatus,
}: {
  user: User | null;
  subscriptionStatus: string;
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [startMileage, setStartMileage] = useState("");
  const [endMileage, setEndMileage] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const lastYear = new Date().getFullYear() - 1;
    return new Date(lastYear, 0, 1);
  });
  const [endDate, setEndDate] = useState(() => {
    const lastYear = new Date().getFullYear() - 1;
    return new Date(lastYear, 11, 31);
  });
  const [mileageLog, setMileageLog] = useState<MileageLog>();
  const [vehicle, setVehicle] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [totalPersonalMiles, setTotalPersonalMiles] = useState("0");
  const [entryCount, setEntryCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  const handleGenerateMileageLog = async () => {
    const start = parseInt(startMileage);
    const end = parseInt(endMileage);
    const personalMiles = parseInt(totalPersonalMiles) || 0;

    setIsGenerating(true);

    try {
      const result = await generateMileageLogFromForm({
        startMileage: start,
        endMileage: end,
        startDate,
        endDate,
        totalPersonalMiles: personalMiles,
        vehicle,
        businessType,
        subscriptionStatus: subscriptionStatus || "inactive",
        currentEntryCount: entryCount,
      });
      if (result) {
        setMileageLog(result);
        setEntryCount((prevCount) => prevCount + result.log_entries.length);
        setShowForm(false);
        setIsGenerating(false);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        notifications.show({
          title: "Error",
          message:
            error?.message ||
            "Failed to generate mileage log. Please try again.",
          color: "red",
          icon: <IconX />,
        });
        setShowForm(true);
      }
    }
  };

  const handleNewLog = () => {
    resetForm();
    setMileageLog(undefined);
    setShowForm(true);
  };

  const resetForm = () => {
    setStartMileage("");
    setEndMileage("");
    setStartDate(new Date(new Date().getFullYear() - 1, 0, 1));
    setEndDate(new Date(new Date().getFullYear() - 1, 11, 31));
    setTotalPersonalMiles("0");
    setVehicle("");
    setBusinessType("");
  };

  const saveMileageLog = async () => {
    if (!mileageLog || mileageLog.log_entries.length === 0) {
      notifications.show({
        title: "No Entries to Save",
        message: "Please generate a mileage log first.",
        color: "red",
        icon: <IconX />,
      });
      return;
    }

    setIsSaving(true);
    try {
      if (user) {
        const result = await saveMileageLogApi(mileageLog);

        if (result.success) {
          notifications.show({
            title: "Success",
            message: "Mileage log saved successfully.",
            color: "green",
            icon: <IconCheck />,
          });
        } else {
          notifications.show({
            title: "Error",
            message: result.message,
            color: "red",
            icon: <IconX />,
          });
        }
      } else {
        throw new Error("User is not logged in");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error saving mileage log:", error.message);
      }
      notifications.show({
        title: "Error",
        message: "Failed to save mileage log. Please try again.",
        color: "red",
        icon: <IconX />,
      });
    } finally {
      setIsSaving(false);
    }
  };
  const setDownloadingPDF = async () => {
    setIsDownloading(true);
    return isDownloading;
  };

  const generatePDF = async () => {
    if (!pdfRef.current) return;
    await setDownloadingPDF();
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 1, // Ensures high resolution
        useCORS: true,
        windowWidth: pdfRef.current.scrollWidth,
        windowHeight: pdfRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let position = 0;

      while (position < imgHeight) {
        pdf.addImage(imgData, "PNG", 0, position * -1, imgWidth, imgHeight);
        position += pageHeight;
        if (position < imgHeight) pdf.addPage();
      }

      pdf.save("my-document.pdf");
      setIsDownloading(false);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      setIsDownloading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Container size="xl" mt={20} py="xl" px={isMobile ? "xs" : "md"}>
      {showForm ? (
        <Card withBorder pos="relative">
          <LoadingOverlay visible={isGenerating} overlayProps={{ blur: 2 }} />
          <Stack gap="md" mb="md">
            <Title order={2}>Generate Mileage Log</Title>
            <Text c="dimmed" size="sm">
              Fill out the form to generate a mileage log.
            </Text>
          </Stack>
          <MileageForm
            startMileage={startMileage}
            endMileage={endMileage}
            startDate={startDate}
            endDate={endDate}
            totalPersonalMiles={totalPersonalMiles}
            vehicle={vehicle}
            businessType={businessType}
            subscriptionStatus={subscriptionStatus}
            entryCount={entryCount}
            onStartMileageChange={setStartMileage}
            onEndMileageChange={setEndMileage}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onTotalPersonalMilesChange={setTotalPersonalMiles}
            onVehicleChange={setVehicle}
            onBusinessTypeChange={setBusinessType}
            onGenerate={handleGenerateMileageLog}
            onReset={resetForm}
          />
        </Card>
      ) : null}

      {mileageLog && mileageLog.log_entries.length > 0 && (
        <Card withBorder mt="md" mb="md">
          <Group justify="space-between" mb="md" wrap="wrap">
            <Title order={2} size={isMobile ? "h3" : "h2"}>
              Mileage Log Details
            </Title>
            {isMobile ? (
              <Stack w="100%" mt="sm">
                <PrintMilageLog log={mileageLog} />
                <Group grow>
                  {user && (
                    <Button
                      leftSection={<IconDeviceFloppy />}
                      onClick={saveMileageLog}
                      disabled={isSaving}
                      variant="gradient"
                      size={isMobile ? "md" : "sm"}
                    >
                      {isSaving ? "Saving..." : "Save Log"}
                    </Button>
                  )}
                  <Button
                    leftSection={<IconRefresh />}
                    onClick={handleNewLog}
                    size={isMobile ? "md" : "sm"}
                    variant="light"
                  >
                    Generate New Log
                  </Button>
                  <Button
                    leftSection={<IconFileDownload />}
                    onClick={generatePDF}
                    loading={isDownloading}
                    size={isMobile ? "md" : "sm"}
                    variant="light"
                  >
                    Download PDF
                  </Button>
                </Group>
              </Stack>
            ) : (
              <Group justify="flex-end" mt="md" mb="md">
                <Button
                  leftSection={<IconRefresh />}
                  onClick={handleNewLog}
                  size={isMobile ? "md" : "sm"}
                  variant="light"
                >
                  Generate New Log
                </Button>
                <PrintMilageLog log={mileageLog} />
                <Button
                  leftSection={<IconFileDownload />}
                  onClick={generatePDF}
                  loading={isDownloading}
                  size={isMobile ? "md" : "sm"}
                  variant="light"
                >
                  Download PDF
                </Button>

                {user && (
                  <Button
                    leftSection={<IconDeviceFloppy />}
                    onClick={saveMileageLog}
                    disabled={isSaving}
                    variant="light"
                    size={isMobile ? "md" : "sm"}
                  >
                    {isSaving ? "Saving..." : "Save Log"}
                  </Button>
                )}
              </Group>
            )}
          </Group>
          <div ref={pdfRef}>
            <MileageLogDisplay
              startDate={startDate}
              endDate={endDate}
              totalMileage={mileageLog.total_mileage}
              totalBusinessMiles={mileageLog.total_business_miles}
              totalPersonalMiles={mileageLog.total_personal_miles}
              startMileage={mileageLog.start_mileage}
              endMileage={mileageLog.end_mileage}
              businessDeductionRate={mileageLog.business_deduction_rate}
              businessDeductionAmount={mileageLog.business_deduction_amount}
              vehicleInfo={mileageLog.vehicle_info}
              mileageLog={mileageLog.log_entries}
            />
          </div>
        </Card>
      )}
    </Container>
  );
};
