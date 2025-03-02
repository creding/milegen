import { Button } from "@mantine/core";
import Link from "next/link";

export function SignupButton() {
  return (
    <>
      <Link href={{ pathname: "/", query: { signup: true } }}>
        <Button variant="outline">Sign Up</Button>
      </Link>
    </>
  );
}
