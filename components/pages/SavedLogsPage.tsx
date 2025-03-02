"use client";

import { MileageLog } from "@/types/mileage";
import { IconEye, IconPrinter, IconTrash } from "@tabler/icons-react";
import { deleteMileageLog } from "@/app/actions/deleteMileageLog";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import {
  Card,
  Text,
  Table,
  Group,
  Container,
  Title,
  ActionIcon,
  TableThead,
  TableTr,
  TableTh,
  TableTbody,
  TableTd,
  Stack,
} from "@mantine/core";

export const SavedLogsPage = ({ logs }: { logs: MileageLog[] }) => {
  console.log(logs);
  const handleDelete = async (logId: number, userId: string) => {
    try {
      const result = await deleteMileageLog(logId, userId);
      if (result.success) {
        notifications.show({
          title: "Success",
          message: "Mileage log deleted successfully.",
          color: "green",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error deleting mileage log:", error);
      notifications.show({
        title: "Error",
        message: "Failed to delete mileage log. Please try again.",
        color: "red",
      });
    }
  };

  const handlePrint = (log: MileageLog) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const content = `
      <html>
        <head>
          <title>Mileage Log</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8f9fa; }
            h1 { color: #228be6; }
            .header { margin-bottom: 30px; }
            .info { margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Mileage Log</h1>
            <div class="info">Start Date: ${new Date(
              log.start_date
            ).toLocaleDateString()}</div>
            <div class="info">End Date: ${new Date(
              log.end_date
            ).toLocaleDateString()}</div>
            <div class="info">Total Mileage: ${log.total_mileage}</div>
            <div class="info">Business Mileage: ${log.total_mileage}</div>
            <div class="info">Personal Mileage: ${
              log.total_personal_miles
            }</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Starting Mileage</th>
                <th>Ending Mileage</th>
                <th>Business Miles</th>
                <th>Destination</th>
                <th>Business Purpose</th>
              </tr>
            </thead>
            <tbody>
              ${log.log_entries
                .map(
                  (entry) => `
                <tr>
                  <td>${new Date(entry.date).toLocaleDateString()}</td>
                  <td>${entry.startMileage}</td>
                  <td>${entry.endMileage}</td>
                  <td>${entry.businessMiles}</td>
                  <td>${entry.destination}</td>
                  <td>${entry.businessPurpose}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Container size="xl" py="xl" mt={20}>
      <Card withBorder>
        <Stack gap={2} mb="md">
          <Title order={2}>Saved Mileage Logs</Title>
          <Text c="dimmed" size="sm">
            View and manage your saved mileage logs
          </Text>
        </Stack>

        <Table striped highlightOnHover>
          <TableThead>
            <TableTr>
              <TableTh>Date Range</TableTh>
              <TableTh>Total Miles</TableTh>
              <TableTh>Business Miles</TableTh>
              <TableTh>Personal Miles</TableTh>
              <TableTh>Actions</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {logs?.map((log) => (
              <TableTr key={log.id}>
                <TableTd>
                  {new Date(log.start_date).toLocaleDateString()} -{" "}
                  {new Date(log.end_date).toLocaleDateString()}
                </TableTd>
                <TableTd>{log.total_mileage}</TableTd>
                <TableTd>{log.total_mileage}</TableTd>
                <TableTd>{log.total_personal_miles}</TableTd>
                <TableTd>
                  <Group gap="xs">
                    <ActionIcon
                      component={Link}
                      href={`/saved-logs/${log.id}`}
                      variant="subtle"
                      color="blue"
                      size="lg"
                    >
                      <IconEye size="1.125rem" />
                    </ActionIcon>
                    <ActionIcon
                      onClick={() => handlePrint(log)}
                      variant="subtle"
                      color="gray"
                      size="lg"
                    >
                      <IconPrinter size="1.125rem" />
                    </ActionIcon>
                    <ActionIcon
                      onClick={() => handleDelete(log.id, log.user_id)}
                      variant="subtle"
                      color="red"
                      size="lg"
                    >
                      <IconTrash size="1.125rem" />
                    </ActionIcon>
                  </Group>
                </TableTd>
              </TableTr>
            ))}
          </TableTbody>
        </Table>
      </Card>
    </Container>
  );
};
