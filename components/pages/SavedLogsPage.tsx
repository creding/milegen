"use client";

import { MileageLog } from "@/app/actions/mileageGenerator";
import { IconEye, IconTrash, IconPlus, IconFileOff } from "@tabler/icons-react";
import { deleteMileageLog } from "@/app/actions/deleteMileageLog";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import { format, parseISO } from "date-fns";

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
  Tooltip,
  Modal,
} from "@mantine/core";
import { useState, useTransition } from "react";

export const SavedLogsPage = ({ logs }: { logs: MileageLog[] }) => {
  console.log(logs);
  const [isPending, startTransition] = useTransition();
  const [modalOpened, setModalOpened] = useState(false);
  const [logIdToDelete, setLogIdToDelete] = useState<string | null>(null);
  const [userIdForDelete, setUserIdForDelete] = useState<string | null>(null);

  const handleDelete = (logId: string, userId: string) => {
    setLogIdToDelete(logId);
    setUserIdForDelete(userId);
    setModalOpened(true);
  };

  const confirmDelete = async () => {
    if (!logIdToDelete || !userIdForDelete) return;

    startTransition(async () => {
      try {
        const result = await deleteMileageLog(logIdToDelete, userIdForDelete);

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
    });

    setModalOpened(false);
    setLogIdToDelete(null);
    setUserIdForDelete(null);
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
            You haven&apos;t created any mileage logs yet. Create your first log
            to track your business mileage for tax deductions.
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
    <>
      <Container size="xl" py="xl" mt={60}>
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
                  <TableTh style={{ textAlign: "right" }}>Total Miles</TableTh>
                  <TableTh style={{ textAlign: "right" }}>
                    Business Miles
                  </TableTh>
                  <TableTh style={{ textAlign: "right" }}>
                    Personal Miles
                  </TableTh>
                  <TableTh style={{ textAlign: "center" }}>Actions</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {logs?.map((log, index) => (
                  <TableTr key={`${log.start_date}-${index}`}>
                    <TableTd>
                      {log.start_date
                        ? format(parseISO(log.start_date), "MMM d, yyyy")
                        : "N/A"}{" "}
                      -
                      {log.end_date
                        ? format(parseISO(log.end_date), "MMM d, yyyy")
                        : "N/A"}
                    </TableTd>
                    <TableTd style={{ textAlign: "right" }}>
                      {log.total_mileage}
                    </TableTd>
                    <TableTd style={{ textAlign: "right" }}>
                      {log.total_business_miles}
                    </TableTd>
                    <TableTd style={{ textAlign: "right" }}>
                      {log.total_personal_miles}
                    </TableTd>
                    <TableTd>
                      <Group gap="xs" justify="flex-start">
                        <Tooltip
                          label="View Log Details"
                          withArrow
                          position="top"
                        >
                          <ActionIcon
                            component={Link}
                            href={`/saved-logs/${log.id}`}
                            variant="subtle"
                            color="blue"
                            size="lg"
                          >
                            <IconEye size="1.125rem" />
                          </ActionIcon>
                        </Tooltip>

                        <Tooltip label="Delete Log" withArrow position="top">
                          <ActionIcon
                            onClick={() =>
                              handleDelete(
                                log.id as string,
                                log.user_id as string
                              )
                            }
                            variant="subtle"
                            color="red"
                            size="lg"
                          >
                            <IconTrash size="1.125rem" />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </TableTd>
                  </TableTr>
                ))}
              </TableTbody>
            </Table>
          )}
        </Card>
      </Container>
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Confirm Deletion"
        padding="xs"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <Text>Are you sure you want to delete this mileage log?</Text>
        <Text c="dimmed" size="sm">
          This action cannot be undone.
        </Text>
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={() => setModalOpened(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={confirmDelete} loading={isPending}>
            Delete Log
          </Button>
        </Group>
      </Modal>
    </>
  );
};
