import { Anchor, Chip, Group } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import Link from "next/link";

export const AccountButton = ({
  subscriptionStatus,
}: {
  subscriptionStatus: string | null;
}) => {
  return (
    <Group gap={3}>
      <Anchor component={Link} href="/account">
        <Group gap={2}>
          <IconUser size={16} />
          Account
        </Group>
      </Anchor>
      {subscriptionStatus === "active" && (
        <Chip defaultChecked size="xs" variant="light" color="green">
          Subscribed
        </Chip>
      )}
    </Group>
  );
};
