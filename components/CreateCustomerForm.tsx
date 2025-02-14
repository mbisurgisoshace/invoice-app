"use client";

import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useActionState, useState } from "react";

import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { SubmitButton } from "./SubmitButton";

import { createCustomer } from "@/app/actions/actions";
import { createCustomerSchema } from "@/app/utils/schemas";
import { createDefaultInvoiceCode } from "@/app/utils/utils";

interface CreateCustomerFormProps {}

export function CreateCustomerForm({}: CreateCustomerFormProps) {
  const [invoiceCode, setInvoiceCode] = useState("");
  const [lastResult, action] = useActionState(createCustomer, undefined);
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: createCustomerSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <form id={form.id} action={action} onSubmit={form.onSubmit} noValidate>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <div>
                <Label>Name</Label>
                <Input
                  placeholder="John Doe"
                  key={fields.name.key}
                  name={fields.name.name}
                  onBlur={(e) => {
                    if (!invoiceCode) {
                      setInvoiceCode(createDefaultInvoiceCode(e.target.value));
                    }
                  }}
                  //defaultValue={`${firstName} ${lastName}`}
                />
                <p className="text-red-500 text-sm">{fields.name.errors}</p>
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  placeholder="john@gmail.com"
                  key={fields.email.key}
                  name={fields.email.name}
                  //defaultValue={`${firstName} ${lastName}`}
                />
                <p className="text-red-500 text-sm">{fields.email.errors}</p>
              </div>

              <div>
                <Label>Tax Number</Label>
                <Input
                  placeholder="XXX-XXX-XXX"
                  key={fields.taxNumber.key}
                  name={fields.taxNumber.name}
                  //defaultValue={`${firstName} ${lastName}`}
                />
                <p className="text-red-500 text-sm">
                  {fields.taxNumber.errors}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <Label>Address</Label>
                <Input
                  placeholder="Street 123"
                  key={fields.address.key}
                  name={fields.address.name}
                  //defaultValue={`${firstName} ${lastName}`}
                />
                <p className="text-red-500 text-sm">{fields.address.errors}</p>
              </div>

              <div>
                <Label>Phone Number</Label>
                <Input
                  placeholder="123-456-7890"
                  key={fields.phoneNumber.key}
                  name={fields.phoneNumber.name}
                  //defaultValue={`${firstName} ${lastName}`}
                />
                <p className="text-red-500 text-sm">
                  {fields.phoneNumber.errors}
                </p>
              </div>

              <div>
                <Label>Invoice Code</Label>
                <Input
                  placeholder="AA"
                  value={invoiceCode}
                  key={fields.invoiceCode.key}
                  name={fields.invoiceCode.name}
                  onChange={(e) => setInvoiceCode(e.target.value)}
                  //defaultValue={`${firstName} ${lastName}`}
                />
                <p className="text-red-500 text-sm">
                  {fields.invoiceCode.errors}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end mt-6">
            <div>
              <SubmitButton text="Create Customer" />
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
