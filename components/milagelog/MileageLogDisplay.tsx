"use client";

import {
  Container,
  Group,
  Text,
  TableThead,
  TableTr,
  TableTh,
  TableTbody,
  TableTd,
  Stack,
  Card,
  Box,
  ScrollArea,
  Title,
  Divider,
  Paper,
  ThemeIcon,
  Table,
  Button,
} from "@mantine/core";
import {
  IconCar,
  IconCalendar,
  IconRoad,
  IconBriefcase,
  IconHome,
  IconGauge,
  IconCoin,
  IconReceipt,
  IconFileDownload,
} from "@tabler/icons-react";

import { useMediaQuery } from "@mantine/hooks";
import type { MileageEntry, MileageLog } from "@/app/actions/mileageGenerator";
import { DownloadSpreadsheet } from "./DownloadSpreadsheet";
import { PrintMilageLog } from "./PrintMilageLog";
import { GeneratePDF } from "./GeneratePDF";
import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export function MileageLogDisplay({ log }: { log: MileageLog }) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  if (log.log_entries.length > 0) {
    console.log("First mileage log entry:", log.log_entries[0]);
  }

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

  const MobileLogEntry = ({ entry }: { entry: MileageEntry }) => (
    <Card shadow="sm" p="md" radius="md" withBorder mb="sm">
      <Text fw={700} mb="xs">
        {new Date(entry.date).toLocaleDateString()}
      </Text>
      <Stack gap="xs">
        <Group justify="apart">
          <Text size="sm" c="dimmed">
            Vehicle:
          </Text>
          <Text size="sm">{entry.vehicle_info || log.vehicle_info}</Text>
        </Group>
        <Group justify="apart">
          <Text size="sm" c="dimmed">
            Starting Mileage:
          </Text>
          <Text size="sm">{parseFloat(entry.start_mileage.toFixed(1))}</Text>
        </Group>
        <Group justify="apart">
          <Text size="sm" c="dimmed">
            Ending Mileage:
          </Text>
          <Text size="sm">{parseFloat(entry.end_mileage.toFixed(1))}</Text>
        </Group>
        <Divider my="xs" />
        <Text size="sm" c="dimmed" mt="xs">
          Purpose:
        </Text>
        <Text size="sm">{entry.purpose}</Text>
        <Divider my="xs" />
        <Group justify="apart">
          <Text size="sm" c="dimmed">
            Total Miles:
          </Text>
          <Text size="sm">{parseFloat(entry.miles.toFixed(1))} miles</Text>
        </Group>
        <Group justify="apart">
          <Text size="sm" c="dimmed">
            Type:
          </Text>
          <Text size="sm">{entry.type}</Text>
        </Group>
      </Stack>
    </Card>
  );

  return (
    <div ref={pdfRef}>
      <Stack gap={isMobile ? "md" : 5}>
        {isMobile ? (
          <Paper p="md" radius="sm" withBorder shadow="xs" w="100%">
            <Stack gap="xs">
              <Stack justify="flex-start">
                <DownloadSpreadsheet log={log} />
                <PrintMilageLog log={log} />
                <GeneratePDF log={log} />
              </Stack>

              <Group justify="apart">
                <Text fw={500} c="dimmed">
                  Vehicle:
                </Text>
                <Text fw={600}>{log.vehicle_info || "Not specified"}</Text>
              </Group>

              <Group justify="apart">
                <Text fw={500} c="dimmed">
                  Period:
                </Text>
                <Text fw={600}>
                  {log.start_date} - {log.end_date}
                </Text>
              </Group>

              <Divider my="xs" label="Odometer" labelPosition="center" />

              <Group justify="apart">
                <Text fw={500} c="dimmed">
                  Starting Odometer:
                </Text>
                <Text fw={600}>{parseFloat(log.start_mileage.toFixed(1))}</Text>
              </Group>
              <Group justify="apart">
                <Text fw={500} c="dimmed">
                  Ending Odometer:
                </Text>
                <Text fw={600}>{parseFloat(log.end_mileage.toFixed(1))}</Text>
              </Group>

              <Divider my="xs" label="Mileage" labelPosition="center" />

              <Group justify="apart">
                <Text fw={500} c="dimmed">
                  Total Mileage:
                </Text>
                <Text fw={600}>
                  {parseFloat(log.total_mileage.toFixed(1))} miles
                </Text>
              </Group>
              <Group justify="apart">
                <Text fw={500} c="dimmed">
                  Business Mileage:
                </Text>
                <Text fw={600}>
                  {parseFloat(log.total_business_miles.toFixed(1))} miles
                </Text>
              </Group>
              <Group justify="apart">
                <Text fw={500} c="dimmed">
                  Personal Mileage:
                </Text>
                <Text fw={600}>
                  {parseFloat(log.total_personal_miles.toFixed(1))} miles
                </Text>
              </Group>

              {log.business_deduction_rate && log.business_deduction_amount && (
                <>
                  <Divider
                    my="xs"
                    label="Tax Deduction"
                    labelPosition="center"
                  />
                  <Group justify="apart">
                    <Text fw={500} c="dimmed">
                      Rate:
                    </Text>
                    <Text fw={600}>
                      ${log.business_deduction_rate.toFixed(2)}/mile
                    </Text>
                  </Group>
                  <Group justify="apart">
                    <Text fw={500} c="dimmed">
                      Deduction:
                    </Text>
                    <Text fw={600}>
                      ${log.business_deduction_amount.toFixed(2)}
                    </Text>
                  </Group>
                </>
              )}
            </Stack>
          </Paper>
        ) : (
          <>
            <Paper p="lg" radius="sm" withBorder shadow="xs" w="100%">
              <Group justify="flex-end" mb="xl" gap="xs">
                <DownloadSpreadsheet log={log} />
                <GeneratePDF log={log} />
                <PrintMilageLog log={log} />
              </Group>
              <Group grow align="flex-start" gap="xs">
                <Stack gap="md">
                  <Group>
                    <ThemeIcon
                      size="md"
                      variant="light"
                      color="blue"
                      radius="xl"
                    >
                      <IconCar size="1rem" />
                    </ThemeIcon>
                    <Stack gap={0}>
                      <Text size="xs" c="dimmed">
                        Vehicle
                      </Text>
                      <Text fw={600}>
                        {log.vehicle_info || "Not specified"}
                      </Text>
                    </Stack>
                  </Group>

                  <Group>
                    <ThemeIcon
                      size="md"
                      variant="light"
                      color="blue"
                      radius="xl"
                    >
                      <IconCalendar size="1rem" />
                    </ThemeIcon>
                    <Stack gap={0}>
                      <Text size="xs" c="dimmed">
                        Period
                      </Text>
                      <Text fw={600}>
                        {log.start_date} - {log.end_date}
                      </Text>
                    </Stack>
                  </Group>
                  <Group>
                    <ThemeIcon
                      size="md"
                      variant="light"
                      color="blue"
                      radius="xl"
                    >
                      <IconRoad size="1rem" />
                    </ThemeIcon>
                    <Stack gap={0}>
                      <Text size="xs" c="dimmed">
                        Total Mileage
                      </Text>
                      <Text fw={600}>
                        {parseFloat(log.total_mileage.toFixed(1))} miles
                      </Text>
                    </Stack>
                  </Group>
                </Stack>

                <Stack gap="md">
                  <Group>
                    <ThemeIcon
                      size="md"
                      variant="light"
                      color="cyan"
                      radius="xl"
                    >
                      <IconGauge size="1rem" />
                    </ThemeIcon>
                    <Stack gap={0}>
                      <Text size="xs" c="dimmed">
                        Odometer Reading
                      </Text>
                      <Text fw={600}>
                        {parseFloat(log.start_mileage.toFixed(1))} →{" "}
                        {parseFloat(log.end_mileage.toFixed(1))}
                      </Text>
                    </Stack>
                  </Group>
                  <Group>
                    <ThemeIcon
                      size="md"
                      variant="light"
                      color="gray"
                      radius="xl"
                    >
                      <IconHome size="1rem" />
                    </ThemeIcon>
                    <Stack gap={0}>
                      <Text size="xs" c="dimmed">
                        Personal Miles
                      </Text>
                      <Text fw={600}>
                        {parseFloat(log.total_personal_miles.toFixed(1))} miles
                      </Text>
                    </Stack>
                  </Group>
                  <Group>
                    <ThemeIcon
                      size="md"
                      variant="light"
                      color="green"
                      radius="xl"
                    >
                      <IconBriefcase size="1rem" />
                    </ThemeIcon>
                    <Stack gap={0}>
                      <Text size="xs" c="dimmed">
                        Business Miles
                      </Text>
                      <Text fw={600}>
                        {parseFloat(log.total_business_miles.toFixed(1))} miles
                      </Text>
                    </Stack>
                  </Group>
                </Stack>

                <Stack gap="md">
                  <Group>
                    <ThemeIcon
                      size="md"
                      variant="light"
                      color="yellow"
                      radius="xl"
                    >
                      <IconCoin size="1rem" />
                    </ThemeIcon>
                    <Stack gap={0}>
                      <Text size="xs" c="dimmed">
                        Deduction Rate
                      </Text>
                      <Text fw={600}>
                        ${log.business_deduction_rate?.toFixed(2) || "0.00"}
                        /mile
                      </Text>
                    </Stack>
                  </Group>
                  <Group>
                    <ThemeIcon
                      size="md"
                      variant="light"
                      color="green"
                      radius="xl"
                    >
                      <IconReceipt size="1rem" />
                    </ThemeIcon>
                    <Stack gap={0}>
                      <Text size="xs" c="dimmed">
                        Tax Deduction
                      </Text>
                      <Text fw={700} size="lg" c="green">
                        ${log.business_deduction_amount?.toFixed(2) || "0.00"}
                      </Text>
                    </Stack>
                  </Group>
                </Stack>
              </Group>
            </Paper>
          </>
        )}

        {isMobile ? (
          <Stack>
            {log.log_entries.map((entry, index) => (
              <MobileLogEntry key={index} entry={entry} />
            ))}
          </Stack>
        ) : (
          <Paper p="lg" radius="sm" withBorder shadow="xs" w="100%">
            <Title order={4} mb="md">
              Mileage Log Entries
            </Title>
            <Divider mb="md" />
            <ScrollArea>
              <Box maw="100%" w="100%">
                <Table striped highlightOnHover withTableBorder w="100%">
                  <TableThead>
                    <TableTr>
                      <TableTh>Date</TableTh>
                      <TableTh>Vehicle</TableTh>
                      <TableTh>Start</TableTh>
                      <TableTh>End</TableTh>
                      <TableTh>Miles</TableTh>
                      <TableTh>Purpose</TableTh>
                      <TableTh>Type</TableTh>
                    </TableTr>
                  </TableThead>
                  <TableTbody>
                    {log.log_entries.map((entry, index) => (
                      <TableTr key={index}>
                        <TableTd>
                          {new Date(entry.date).toLocaleDateString()}
                        </TableTd>
                        <TableTd>
                          {entry.vehicle_info || log.vehicle_info}
                        </TableTd>
                        <TableTd>
                          {parseFloat(entry.start_mileage.toFixed(1))}
                        </TableTd>
                        <TableTd>
                          {parseFloat(entry.end_mileage.toFixed(1))}
                        </TableTd>
                        <TableTd>{parseFloat(entry.miles.toFixed(1))}</TableTd>
                        <TableTd>{entry.purpose}</TableTd>
                        <TableTd>{entry.type}</TableTd>
                      </TableTr>
                    ))}
                  </TableTbody>
                </Table>
              </Box>
            </ScrollArea>
          </Paper>
        )}
      </Stack>
    </div>
  );
}
