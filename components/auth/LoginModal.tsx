"use client";

import { Modal } from "@mantine/core";
import { useRouter } from "next/navigation";
import AuthForm from "./AuthForm";

export function LoginModal() {
  const router = useRouter();

  return (
    <Modal
      radius="md"
      centered
      shadow="lg"
      opened={true}
      onClose={() => router.push("/")}
      transitionProps={{
        transition: "fade-up",
        timingFunction: "linear",
      }}
      size="lg"
    >
      <AuthForm />
    </Modal>
  );
}
