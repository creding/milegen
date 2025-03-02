import { Box, Flex, Text } from "@mantine/core";

export const CustomInputWrapper = ({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: React.ReactNode;
  children: React.ReactNode;
}) => (
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
    {children}
  </Box>
);
