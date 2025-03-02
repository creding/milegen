"use client";

import { MileageLog } from "@/types/mileage";
import { IconEye, IconPrinter, IconTrash } from "@tabler/icons-react";
import { deleteMileageLog } from "@/app/actions/deleteMileageLog";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import { printMileageLog } from "@/components/milagelog/PrintMilageLog";
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
  const handleDelete = async (logId: string, userId: string) => {
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

  return (
    <Container size="xl" py="xl" mt={20}>
      <Card withBorder>
        <Stack gap="md" mb="md">
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
                <TableTd>{log.total_business_miles}</TableTd>
                <TableTd>{log.total_personal_miles}</TableTd>
                <TableTd>
                  <Group gap="xs" justify="flex-start">
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
                      onClick={() => printMileageLog(log)}
                      variant="subtle"
                      color="gray"
                      size="lg"
                    >
                      <IconPrinter size="1.125rem" />
                    </ActionIcon>
                    <ActionIcon
                      onClick={() => handleDelete(log.id as string, log.user_id as string)}
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
