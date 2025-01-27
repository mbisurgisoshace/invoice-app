"use client";

import { Loader2Icon } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "./ui/button";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <Button disabled className="w-full">
          <Loader2Icon className="size-4 mr-2 animate-spin" /> Please wait...
        </Button>
      ) : (
        <Button type="submit" className="w-full">
          Submit
        </Button>
      )}
    </>
  );
}
