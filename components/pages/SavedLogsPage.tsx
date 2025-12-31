"use client";

import { MileageLog } from "@/app/actions/mileageGenerator";
import {
  IconEye,
  IconPrinter,
  IconTrash,
  IconPlus,
  IconFileOff,
  IconCalendar,
  IconCar,
  IconFileText,
} from "@tabler/icons-react";
import { deleteMileageLog } from "@/app/actions/deleteMileageLog";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import { printMileageLog } from "@/components/milagelog/PrintMilageLog";
import {
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
  ThemeIcon,
  Badge,
  Tooltip,
} from "@mantine/core";
import { ProCard } from "@/components/ui/ProCard";

export const SavedLogsPage = ({ logs }: { logs: MileageLog[] }) => {
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
    <ProCard p="xl" radius="md">
      <Center>
        <Stack align="center" gap="md" py={60}>
          <ThemeIcon size={80} radius={100} variant="light" color="gray">
            <IconFileOff size={40} />
          </ThemeIcon>
          <Title order={3}>No Mileage Logs Found</Title>
          <Text c="dimmed" ta="center" maw={400}>
            You haven&apos;t created any mileage logs yet. Create your first log
            to track your business mileage for tax deductions.
          </Text>
          <Link href="/generator">
            <Button
              leftSection={<IconPlus size="1rem" />}
              variant="gradient"
              gradient={{ from: "blue", to: "cyan" }}
              size="md"
              radius="xl"
              mt="md"
            >
              Create Your First Log
            </Button>
          </Link>
        </Stack>
      </Center>
    </ProCard>
  );

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>My Mileage Logs</Title>
            <Text c="dimmed" size="sm">
              Manage and export your IRS-compliant mileage reports
            </Text>
          </div>
          {logs.length > 0 && (
            <Link href="/generator">
              <Button
                leftSection={<IconPlus size="1rem" />}
                variant="filled"
                color="blue"
                radius="xl"
                size="sm"
              >
                Generate New Log
              </Button>
            </Link>
          )}
        </Group>

        {logs.length === 0 ? (
          <EmptyState />
        ) : (
          <ProCard p={0} radius="md" style={{ overflow: "hidden" }}>
            <Table horizontalSpacing="lg" verticalSpacing="md">
              <TableThead bg="gray.0">
                <TableTr>
                  <TableTh fw={600} w={300}>
                    Date Range
                  </TableTh>
                  <TableTh fw={600}>Total Miles</TableTh>
                  <TableTh fw={600}>Vehicle</TableTh>
                  <TableTh fw={600} ta="right">
                    Actions
                  </TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {logs?.map((log, index) => (
                  <TableTr key={`${log.start_date}-${index}`}>
                    <TableTd>
                      <Group gap="sm">
                        <ThemeIcon
                          color="blue"
                          variant="light"
                          size="md"
                          radius="md"
                        >
                          <IconCalendar size={18} />
                        </ThemeIcon>
                        <div>
                          <Text size="sm" fw={500}>
                            {new Date(log.start_date).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </Text>
                          <Text size="xs" c="dimmed">
                            to{" "}
                            {new Date(log.end_date).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </Text>
                        </div>
                      </Group>
                    </TableTd>
                    <TableTd>
                      <Badge
                        size="lg"
                        variant="light"
                        color="blue"
                        leftSection={<IconFileText size={14} />}
                      >
                        {log.total_mileage.toLocaleString()} mi
                      </Badge>
                    </TableTd>
                    <TableTd>
                      {log.vehicle_info && (
                        <Group gap="xs" c="dimmed">
                          <IconCar size={16} />
                          <Text size="sm">{log.vehicle_info}</Text>
                        </Group>
                      )}
                    </TableTd>
                    <TableTd>
                      <Group gap="xs" justify="flex-end">
                        <Tooltip label="View Details" withArrow>
                          <Link href={`/saved-logs/${log.id}`}>
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              size="lg"
                              component="div"
                            >
                              <IconEye size="1.125rem" />
                            </ActionIcon>
                          </Link>
                        </Tooltip>

                        <Tooltip label="Print / Download PDF" withArrow>
                          <ActionIcon
                            onClick={() => printMileageLog(log)}
                            variant="subtle"
                            color="gray"
                            size="lg"
                          >
                            <IconPrinter size="1.125rem" />
                          </ActionIcon>
                        </Tooltip>

                        <Tooltip label="Delete Log" withArrow>
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
          </ProCard>
        )}
      </Stack>
    </Container>
  );
};
