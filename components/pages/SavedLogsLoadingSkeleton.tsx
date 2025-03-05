"use client";

import {
  Card,
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
} from "@mantine/core";

export const SavedLogsLoadingSkeleton = () => {
  // Create an array of 5 items for the skeleton rows
  const skeletonRows = Array(5).fill(0);

  return (
    <Container size="xl" py="xl" mt={20}>
      <Card withBorder>
        <Stack gap="md" mb="md">
          <Skeleton height={28} width="40%" radius="sm" />
          <Skeleton height={16} width="60%" radius="sm" />
        </Stack>

        <Table striped>
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
            {skeletonRows.map((_, index) => (
              <TableTr key={index}>
                <TableTd>
                  <Skeleton height={16} radius="sm" />
                </TableTd>
                <TableTd>
                  <Skeleton height={16} width={60} radius="sm" />
                </TableTd>
                <TableTd>
                  <Skeleton height={16} width={60} radius="sm" />
                </TableTd>
                <TableTd>
                  <Skeleton height={16} width={60} radius="sm" />
                </TableTd>
                <TableTd>
                  <Group gap="xs">
                    <Skeleton height={30} width={30} radius="xl" />
                    <Skeleton height={30} width={30} radius="xl" />
                    <Skeleton height={30} width={30} radius="xl" />
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
