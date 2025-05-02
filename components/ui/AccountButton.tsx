import { ActionIcon, Tooltip } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import Link from "next/link";

export const AccountButton = () => {
  return (
    <Tooltip label="Account" position="bottom" withArrow>
      <ActionIcon
        component={Link}
        href="/account"
        variant="subtle"
        color="gray"
        aria-label="Account"
      >
        <IconUser size="1.125rem" />
      </ActionIcon>
    </Tooltip>
  );
};
