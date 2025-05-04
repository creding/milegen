import React from "react";
import { Box, Flex, Text } from "@mantine/core";

interface CustomInputWrapperProps {
  label: string;
  description?: string;
  required?: boolean;
  error?: React.ReactNode;
  children: React.ReactNode;
}

export const CustomInputWrapper = ({
  label,
  description,
  required,
  error,
  children,
}: CustomInputWrapperProps) => (
  <Box mb={10}>
    <Flex align="center" mb={5}>
      <Text fw={500} component="label" size="sm">
        {label}{" "}
        {required && (
          <Text span c="red">
            *
          </Text>
        )}
      </Text>
      {error && (
        <Text ml="auto" size="xs" c="red">
          {error}
        </Text>
      )}
    </Flex>
    {description && (
      <Text size="xs" c="dimmed" mb={5}>
        {description}
      </Text>
    )}
    {children}
  </Box>
);
