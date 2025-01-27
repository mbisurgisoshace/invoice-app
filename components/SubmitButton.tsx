"use client";

import { useFormStatus } from "react-dom";
import { Loader2Icon } from "lucide-react";

import { Button } from "./ui/button";

interface SubmitButtonProps {
  text?: string;
}

export function SubmitButton({ text = "Submit" }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <Button disabled className="w-full">
          <Loader2Icon className="size-4 mr-2 animate-spin" /> Please wait...
        </Button>
      ) : (
        <Button type="submit" className="w-full">
          {text}
        </Button>
      )}
    </>
  );
}
