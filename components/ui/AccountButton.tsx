import { Anchor, Chip, Group } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import Link from "next/link";

export const AccountButton = ({
  subscriptionStatus,
}: {
  subscriptionStatus: "active" | null;
}) => {
  return (
    <Group gap={3}>
      <Link href="/account">
        <Anchor component="span">
          <Group gap={2}>
            <IconUser size={16} />
            Account
          </Group>
        </Anchor>
      </Link>
      {subscriptionStatus === "active" && (
        <Chip defaultChecked size="xs" variant="light" color="green">
          Subscribed
        </Chip>
      )}
    </Group>
  );
};
