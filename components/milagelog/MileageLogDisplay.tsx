"use client";
import React, { useMemo, useRef, useEffect, useState } from "react";
import {
  Card,
  Stack,
  Text,
  Title,
  Table,
  Group,
  Paper,
  Skeleton,
  LoadingOverlay,
  ScrollArea,
  Button, // Import ScrollArea
} from "@mantine/core";
import { format, parseISO } from "date-fns";
import { useMediaQuery } from "@mantine/hooks";
import { Tables } from "@/types/database.types";
import { MileageLogWithEntries } from "@/types/index";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getPaginatedMileageEntries } from "@/lib/data/getPaginatedMileageEntries";
import { MileageLogSummary } from "./MileageLogSummary";
import { SubscriptionAlert } from "../subscription/SubscriptionAlert";
import { IconTableExport } from "@tabler/icons-react";
import { GeneratePDF } from "./GeneratePDF";
import { PrintMilageLog } from "./PrintMilageLog";

interface MileageLogDisplayProps {
  log: MileageLogWithEntries;
  subscriptionStatus?: string | null;
}

export function MileageLogDisplay({
  log,
  subscriptionStatus,
}: MileageLogDisplayProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const scrollAreaRef = useRef<HTMLDivElement>(null); // Ref for ScrollArea
  const [isClient, setIsClient] = useState(false);
  const PAGE_SIZE = 20;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["mileageEntries", log.id],
    queryFn: async ({ pageParam = 1 }) => {
      if (!log.id) throw new Error("Log ID is required");
      const result = await getPaginatedMileageEntries(
        log.id,
        pageParam,
        PAGE_SIZE
      );
      return {
        entries: result.entries,
        nextPage: pageParam + 1,
        totalCount: result.totalCount ?? 0,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // If lastPage is undefined or has no entries, or if the number of entries fetched is less than PAGE_SIZE, there are no more pages.
      if (!lastPage?.entries || lastPage.entries.length < PAGE_SIZE) {
        return undefined;
      }
      // Otherwise, return the next page number
      return lastPage.nextPage;
    },
    placeholderData: (previousData) => previousData,
  });

  const entries = useMemo(
    () => data?.pages.flatMap((page) => page.entries) ?? [],
    [data]
  );
  const totalEntriesCount = useMemo(
    () => data?.pages[0]?.totalCount ?? 0,
    [data]
  );

  const getVehicleInfo = (entry: Tables<"mileage_log_entries">) => {
    return entry.vehicle_info || log.vehicle_info || "Not specified";
  };

  // --- Intersection Observer Logic ---
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure we have the ref elements and we are in the browser
    const observerTarget = loadMoreRef.current;
    const observerRoot = isMobile ? null : scrollAreaRef.current; // Use scroll area as root on desktop

    if (!observerTarget || (!isMobile && !observerRoot)) {
      console.log("Observer setup skipped: Missing target or desktop root.");
      return;
    }

    console.log(
      "Setting up Observer. Root:",
      observerRoot ? "ScrollArea" : "Viewport"
    );

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        console.log(
          "Observer callback fired. isIntersecting:",
          firstEntry.isIntersecting
        );
        // If the sentinel element is intersecting (visible) and there are more pages and we're not already fetching
        if (firstEntry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          console.log("Conditions met! Fetching next page...");
          fetchNextPage();
        } else {
          console.log("Conditions not met or already fetching.", {
            hasNextPage,
            isFetchingNextPage,
          });
        }
      },
      {
        root: observerRoot, // Set the root for observation
        threshold: 0.1, // Trigger when 10% is visible within the root
      }
    );

    observer.observe(observerTarget);

    // Cleanup function to disconnect the observer
    return () => {
      observer.disconnect();
    };
    // Re-run effect if these change, also include scrollAreaRef for desktop
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, isMobile, scrollAreaRef]);
  // --- End Intersection Observer Logic ---

  return (
    <Stack gap="lg">
      <MileageLogSummary log={log} />

      <Group justify="space-between">
        <Title order={3}>Mileage Entries ({totalEntriesCount})</Title>
        <Group justify="flex-end">
          <Button variant="light" leftSection={<IconTableExport size={16} />}>
            Download XLS
          </Button>
          <GeneratePDF log={log} />
          <PrintMilageLog log={log} />
        </Group>
      </Group>

      {subscriptionStatus !== "active" && <SubscriptionAlert />}

      {/* Show overlay during initial load */}
      <LoadingOverlay
        visible={status === "pending"}
        overlayProps={{ radius: "sm", blur: 2 }}
      />

      {/* Only render the layout after client has mounted to prevent hydration mismatch */}
      {isClient &&
        (isMobile ? (
          <Stack mt="md">
            {entries.map((entry: Tables<"mileage_log_entries">) => (
              <Card
                key={entry.id}
                shadow="sm"
                p="md"
                radius="md"
                withBorder
                mb="sm"
              >
                <Text fw={700} mb="xs">
                  {typeof entry.date === "string"
                    ? format(parseISO(entry.date), "MM/dd/yyyy")
                    : "Invalid Date"}
                </Text>
                <Group justify="space-between" mb="xs">
                  <Text size="sm">Vehicle:</Text>
                  <Text size="sm">{getVehicleInfo(entry)}</Text>
                </Group>
                <Group justify="space-between" mb="xs">
                  <Text size="sm">Purpose:</Text>
                  <Text size="sm" fw={500}>
                    {entry.purpose || "N/A"}
                  </Text>
                </Group>
                <Group justify="space-between" mb="xs">
                  <Text size="sm">Type:</Text>
                  <Text size="sm">{entry.type || "N/A"}</Text>
                </Group>
                <Group justify="space-between" mb="xs">
                  <Text size="sm">Miles:</Text>
                  <Text size="sm">{entry.miles?.toFixed(1) ?? "N/A"}</Text>
                </Group>
              </Card>
            ))}
            {/* Render Skeleton Loaders when fetching next page */}
            {isFetchingNextPage &&
              Array.from({ length: 3 }).map((_, index) => (
                <Card
                  key={`skeleton-mobile-${index}`}
                  shadow="sm"
                  p="md"
                  radius="md"
                  withBorder
                  mb="sm"
                >
                  <Skeleton height={8} radius="xl" mb="md" />
                  <Skeleton height={8} mt={6} radius="xl" />
                  <Skeleton height={8} mt={6} radius="xl" />
                  <Skeleton height={8} mt={6} radius="xl" />
                  <Skeleton height={8} mt={6} radius="xl" />
                </Card>
              ))}
            {/* Sentinel element for IntersectionObserver */}
            <div ref={loadMoreRef} style={{ height: "1px" }} />
          </Stack>
        ) : (
          <Paper shadow="xs" withBorder p="md">
            <ScrollArea h={500} viewportRef={scrollAreaRef}>
              <Table
                stickyHeader // Make header sticky
                striped
                highlightOnHover
                verticalSpacing="sm"
              >
                {/* Add the Table Header block */}
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>Vehicle</Table.Th>
                    <Table.Th>Start</Table.Th>
                    <Table.Th>End</Table.Th>
                    <Table.Th>Miles</Table.Th>
                    <Table.Th>Purpose</Table.Th>
                    <Table.Th>Type</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {entries.map((entry: Tables<"mileage_log_entries">) => (
                    <Table.Tr key={entry.id}>
                      {/* Ensure Table Cells match headers */}
                      {/* Date */}
                      <Table.Td>
                        {entry.date
                          ? format(parseISO(entry.date), "MM/dd/yyyy")
                          : "N/A"}
                      </Table.Td>
                      {/* Vehicle */}
                      <Table.Td>{getVehicleInfo(entry)}</Table.Td>
                      {/* Start Odometer */}
                      <Table.Td>{entry.start_mileage ?? "N/A"}</Table.Td>
                      {/* End Odometer */}
                      <Table.Td>{entry.end_mileage ?? "N/A"}</Table.Td>
                      {/* Miles */}
                      <Table.Td>{entry.miles?.toFixed(1) ?? "N/A"}</Table.Td>
                      {/* Purpose */}
                      <Table.Td>{entry.purpose}</Table.Td>
                      {/* Type */}
                      <Table.Td>{entry.type}</Table.Td>
                    </Table.Tr>
                  ))}
                  {/* Render Skeleton Loaders when fetching next page */}
                  {isFetchingNextPage &&
                    Array.from({ length: 3 }).map((_, index) => (
                      <Table.Tr key={`skeleton-desktop-${index}`}>
                        <Table.Td>
                          <Skeleton height={8} radius="xl" />
                        </Table.Td>
                        <Table.Td>
                          <Skeleton height={8} radius="xl" />
                        </Table.Td>
                        <Table.Td>
                          <Skeleton height={8} radius="xl" />
                        </Table.Td>
                        <Table.Td>
                          <Skeleton height={8} radius="xl" />
                        </Table.Td>
                        <Table.Td>
                          <Skeleton height={8} radius="xl" />
                        </Table.Td>
                        <Table.Td>
                          <Skeleton height={8} radius="xl" />
                        </Table.Td>
                        <Table.Td>
                          <Skeleton height={8} radius="xl" />
                        </Table.Td>
                      </Table.Tr>
                    ))}
                </Table.Tbody>
              </Table>
              {/* Move Sentinel element inside ScrollArea */}
              <div ref={loadMoreRef} style={{ height: "1px" }} />
            </ScrollArea>
          </Paper>
        ))}

      {error && (
        <Text c="red" mt="md">
          Error fetching mileage entries:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </Text>
      )}
    </Stack>
  );
}
