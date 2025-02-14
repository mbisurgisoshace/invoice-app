"use client";

import { Prisma } from "@prisma/client";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useActionState, useState } from "react";

import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { SubmitButton } from "./SubmitButton";

import { updateCustomer } from "@/app/actions/actions";
import { createCustomerSchema } from "@/app/utils/schemas";

interface EditCustomerFormProps {
  customer: Prisma.CustomerGetPayload<{}>;
}

export function EditCustomerForm({ customer }: EditCustomerFormProps) {
  const [invoiceCode, setInvoiceCode] = useState(customer.invoiceCode);
  const [lastResult, action] = useActionState(updateCustomer, undefined);
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
          <input type="hidden" name="id" value={customer.id} />
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
                      const name = e.target.value;
                      const words = name.split(" ");

                      let code = "";
                      if (words.length >= 2) {
                        code = words[0].slice(0, 1) + words[1].slice(0, 1);
                      } else {
                        code = words[0].slice(0, 1);
                      }
                      setInvoiceCode(code.toUpperCase());
                    }
                  }}
                  defaultValue={customer.name}
                />
                <p className="text-red-500 text-sm">{fields.name.errors}</p>
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  placeholder="john@gmail.com"
                  key={fields.email.key}
                  name={fields.email.name}
                  defaultValue={customer.email}
                />
                <p className="text-red-500 text-sm">{fields.email.errors}</p>
              </div>

              <div>
                <Label>Tax Number</Label>
                <Input
                  placeholder="XXX-XXX-XXX"
                  key={fields.taxNumber.key}
                  name={fields.taxNumber.name}
                  defaultValue={customer.taxNumber || ""}
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
                  defaultValue={customer.address}
                />
                <p className="text-red-500 text-sm">{fields.address.errors}</p>
              </div>

              <div>
                <Label>Phone Number</Label>
                <Input
                  placeholder="123-456-7890"
                  key={fields.phoneNumber.key}
                  name={fields.phoneNumber.name}
                  defaultValue={customer.phoneNumber || ""}
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
                />
                <p className="text-red-500 text-sm">
                  {fields.invoiceCode.errors}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end mt-6">
            <div>
              <SubmitButton text="Update Customer" />
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
