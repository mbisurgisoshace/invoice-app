"use client";

import { useActionState } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";

import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/SubmitButton";

import { onboardUser } from "../actions/actions";
import { onboardingSchema } from "../utils/schemas";

export default function Onboarding() {
  const [lastResult, action] = useActionState(onboardUser, undefined);
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: onboardingSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <div className="min-h-screen w-screen flex items-center justify-center">
      <Card className="max-w-sm mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">You are almost finished!</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            noValidate
            id={form.id}
            action={action}
            onSubmit={form.onSubmit}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>First Name</Label>
                <Input
                  placeholder="John"
                  key={fields.firstName.key}
                  name={fields.firstName.name}
                  defaultValue={fields.firstName.initialValue}
                />
                <p className="text-red-500 text-sm">
                  {fields.firstName.errors}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Last Name</Label>
                <Input
                  placeholder="Doe"
                  key={fields.lastName.key}
                  name={fields.lastName.name}
                  defaultValue={fields.lastName.initialValue}
                />
                <p className="text-red-500 text-sm">{fields.lastName.errors}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Address</Label>
              <Input
                key={fields.address.key}
                name={fields.address.name}
                placeholder="Chad street 123"
                defaultValue={fields.address.initialValue}
              />
              <p className="text-red-500 text-sm">{fields.address.errors}</p>
            </div>

            <SubmitButton text="Finish onboarding" />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
