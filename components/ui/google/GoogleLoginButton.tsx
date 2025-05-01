import styles from "./GoogleLoginButton.module.css";
import { Button } from "@mantine/core";
import GoogleIcon from "./google-icon.svg";
import Image from "next/image";

type GoogleLoginButtonProps = {
  disabled?: boolean;
  fullWidth?: boolean;
  label?: string;
  onClick: () => void;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  radius?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "outline" | "light" | "subtle" | "default" | "filled" | "gradient";
};

export const GoogleLoginButton = ({
  disabled = false,
  fullWidth = false,
  label = "Continue with Google",
  onClick,
  size,
  radius,
  variant,
}: GoogleLoginButtonProps) => {
  return (
    <Button
      variant={variant}
      size={size}
      radius={radius}
      onClick={onClick}
      disabled={disabled}
      fullWidth={fullWidth}
      leftSection={
        <div className={styles.gsiMaterialButtonIcon}>
          <Image src={GoogleIcon} alt="Google" width={20} height={20} />
        </div>
      }
      styles={(theme) => ({
        root: {
          backgroundColor: theme.white,
          border: "1px solid #ccc",
          color: "#333",
          "&:hover": {
            backgroundColor: "#f2f2f2",
          },
          height: size ? undefined : "40px",
          padding: "0 12px",
        },
        section: {
          marginRight: theme.spacing.sm,
        },
        label: {
          color: "#333",
          fontWeight: 500,
          fontSize: theme.fontSizes.sm,
          lineHeight: "normal",
        },
      })}
    >
      {label}
    </Button>
  );
};
