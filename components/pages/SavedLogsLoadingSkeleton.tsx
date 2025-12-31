"use client";

import { ProCard } from "@/components/ui/ProCard";
import {
  Container,
  Stack,
  Skeleton,
  Table,
  TableThead,
  TableTr,
  TableTh,
  TableTbody,
  TableTd,
  Group,
  Title,
  Text,
} from "@mantine/core";

export const SavedLogsLoadingSkeleton = () => {
  // Create an array of 5 items for the skeleton rows
  const skeletonRows = Array(5).fill(0);

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
          <Skeleton height={36} width={140} radius="xl" />
        </Group>

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
              {skeletonRows.map((_, index) => (
                <TableTr key={index}>
                  <TableTd>
                    <Group gap="sm">
                      <Skeleton height={32} width={32} radius="md" />
                      <div>
                        <Skeleton height={14} width={100} radius="sm" mb={6} />
                        <Skeleton height={12} width={80} radius="sm" />
                      </div>
                    </Group>
                  </TableTd>
                  <TableTd>
                    <Skeleton height={26} width={90} radius="xl" />
                  </TableTd>
                  <TableTd>
                    <Group gap="xs">
                      <Skeleton height={20} width={100} radius="sm" />
                    </Group>
                  </TableTd>
                  <TableTd>
                    <Group gap="xs" justify="flex-end">
                      <Skeleton height={32} width={32} radius="sm" />
                      <Skeleton height={32} width={32} radius="sm" />
                      <Skeleton height={32} width={32} radius="sm" />
                    </Group>
                  </TableTd>
                </TableTr>
              ))}
            </TableTbody>
          </Table>
        </ProCard>
      </Stack>
    </Container>
  );
};
