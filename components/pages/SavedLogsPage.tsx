"use client";

import { MileageLog } from "@/app/actions/mileageGenerator";
import {
  IconEye,
  IconPrinter,
  IconTrash,
  IconPlus,
  IconFileOff,
} from "@tabler/icons-react";
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
  Button,
  Center,
  Paper,
  ThemeIcon,
  Box,
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

  const EmptyState = () => (
    <Paper p="xl" withBorder radius="md" shadow="sm">
      <Center>
        <Stack align="center" gap="md" py="xl">
          <ThemeIcon size={80} radius={100} color="gray">
            <IconFileOff size={40} />
          </ThemeIcon>
          <Title order={3}>No Mileage Logs Found</Title>
          <Text c="dimmed" ta="center" maw={400}>
            You haven't created any mileage logs yet. Create your first log to
            track your business mileage for tax deductions.
          </Text>
          <Button
            component={Link}
            href="/generator"
            leftSection={<IconPlus size="1rem" />}
            variant="gradient"
            gradient={{ from: "blue", to: "cyan" }}
            mt="md"
          >
            Create Your First Log
          </Button>
        </Stack>
      </Center>
    </Paper>
  );

  return (
    <Container size="xl" py="xl">
      <Card withBorder>
        <Stack gap="md" mb="md">
          <Title order={2}>Saved Mileage Logs</Title>
          <Text c="dimmed" size="sm">
            View and manage your saved mileage logs
          </Text>
        </Stack>

        {logs.length === 0 ? (
          <EmptyState />
        ) : (
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
              {logs?.map((log, index) => (
                <TableTr key={`${log.start_date}-${index}`}>
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
                        onClick={() =>
                          handleDelete(log.id as string, log.user_id as string)
                        }
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
        )}
      </Card>
    </Container>
  );
};
