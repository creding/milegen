"use client";

import { MileageLog } from "@/app/actions/mileageGenerator";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  BlobProvider,
  Font,
  pdf,
} from "@react-pdf/renderer";
import { useState } from "react";
import { Modal, Button, Stack, Text as MantineText } from "@mantine/core";
import { IconFileDownload } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";

interface GeneratePDFProps {
  log: MileageLog;
}

// Register fonts
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "/fonts/Roboto-Regular.ttf",
      fontWeight: 400,
    },
    {
      src: "/fonts/Roboto-Bold.ttf",
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Roboto",
  },
  header: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  column: {
    width: "30%",
  },
  infoRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 10,
    color: "#868e96",
    marginBottom: 2,
  },
  value: {
    fontSize: 12,
    color: "#1a1b1e",
    fontWeight: 700,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 8,
    color: "#1971c2",
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f3f5",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#dee2e6",
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: 700,
    color: "#495057",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#dee2e6",
    padding: 8,
  },
  tableCell: {
    fontSize: 10,
    color: "#495057",
  },
  col1: { width: "15%" },
  col2: { width: "20%" },
  col3: { width: "12%" },
  col4: { width: "12%" },
  col5: { width: "12%" },
  col6: { width: "17%" },
  col7: { width: "12%" },
  deductionValue: {
    fontSize: 14,
    fontWeight: 700,
    color: "#2b8a3e",
  },
});

const MileageLogPDF = ({ log }: { log: MileageLog }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.column}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Vehicle</Text>
              <Text style={styles.value}>
                {log.vehicle_info || "Not specified"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Period</Text>
              <Text style={styles.value}>
                {new Date(log.start_date).toLocaleDateString()} -{" "}
                {new Date(log.end_date).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Total Mileage</Text>
              <Text style={styles.value}>
                {parseFloat(log.total_mileage.toFixed(1))} miles
              </Text>
            </View>
          </View>

          <View style={styles.column}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Odometer Reading</Text>
              <Text style={styles.value}>
                {parseFloat(log.start_mileage.toFixed(1))} {" to "}
                {parseFloat(log.end_mileage.toFixed(1))}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Personal Miles</Text>
              <Text style={styles.value}>
                {parseFloat(log.total_personal_miles.toFixed(1))} miles
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Business Miles</Text>
              <Text style={styles.value}>
                {parseFloat(log.total_business_miles.toFixed(1))} miles
              </Text>
            </View>
          </View>

          <View style={styles.column}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Deduction Rate</Text>
              <Text style={styles.value}>
                ${log.business_deduction_rate?.toFixed(2) || "0.00"}/mile
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Tax Deduction</Text>
              <Text style={styles.deductionValue}>
                ${log.business_deduction_amount?.toFixed(2) || "0.00"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.table}>
        <Text style={styles.sectionTitle}>Trip Details</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.col1]}>Date</Text>
          <Text style={[styles.tableHeaderCell, styles.col2]}>Vehicle</Text>
          <Text style={[styles.tableHeaderCell, styles.col3]}>Start</Text>
          <Text style={[styles.tableHeaderCell, styles.col4]}>End</Text>
          <Text style={[styles.tableHeaderCell, styles.col5]}>Miles</Text>
          <Text style={[styles.tableHeaderCell, styles.col6]}>Purpose</Text>
          <Text style={[styles.tableHeaderCell, styles.col7]}>Type</Text>
        </View>
        {log.log_entries.map((entry, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.col1]}>
              {new Date(entry.date).toLocaleDateString()}
            </Text>
            <Text style={[styles.tableCell, styles.col2]}>
              {entry.vehicle_info || log.vehicle_info}
            </Text>
            <Text style={[styles.tableCell, styles.col3]}>
              {parseFloat(entry.start_mileage.toFixed(1))}
            </Text>
            <Text style={[styles.tableCell, styles.col4]}>
              {parseFloat(entry.end_mileage.toFixed(1))}
            </Text>
            <Text style={[styles.tableCell, styles.col5]}>
              {parseFloat(entry.miles.toFixed(1))}
            </Text>
            <Text style={[styles.tableCell, styles.col6]}>{entry.purpose}</Text>
            <Text style={[styles.tableCell, styles.col7]}>{entry.type}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export function GeneratePDF({ log }: GeneratePDFProps) {
  const [opened, setOpened] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const downloadPDF = async () => {
    try {
      console.log("Starting PDF generation...");
      const doc = <MileageLogPDF log={log} />;
      console.log("Created PDF component");

      const blob = await pdf(doc).toBlob();
      console.log("Generated PDF blob");

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mileage-log-${log.start_date}-${log.end_date}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      console.log("PDF downloaded successfully");
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError(err instanceof Error ? err.message : "Failed to generate PDF");
    }
  };

  return (
    <>
      <Button
        variant="transparent"
        size={isMobile ? "md" : "sm"}
        leftSection={<IconFileDownload size={16} />}
        onClick={downloadPDF}
      >
        Download PDF
      </Button>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        size="90%"
        title="Mileage Log PDF Preview"
      >
        <Stack align="center" gap="md">
          {error ? (
            <MantineText c="red" size="sm">
              Error: {error}
            </MantineText>
          ) : (
            <MantineText c="dimmed" size="sm">
              Click the button below to download your mileage log as a PDF
            </MantineText>
          )}
          <Button
            variant="gradient"
            gradient={{ from: "blue", to: "cyan" }}
            leftSection={<IconFileDownload size={16} />}
            onClick={downloadPDF}
          >
            Download PDF
          </Button>
        </Stack>
      </Modal>
    </>
  );
}
