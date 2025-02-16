"use client";

import { CalendarIcon } from "lucide-react";
import { useForm } from "@conform-to/react";
import { useActionState, useMemo, useState } from "react";
import { parseWithZod } from "@conform-to/zod";

import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { SubmitButton } from "./SubmitButton";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

import { createInvoice, getLastInvoiceNumber } from "@/app/actions/actions";
import { createInvoiceSchema } from "@/app/utils/schemas";
import { formatCurrency } from "@/app/utils/utils";
import { Prisma } from "@prisma/client";

interface CreateInvoiceFormProps {
  email: string;
  address: string;
  lastName: string;
  firstName: string;
  nextInvoiceNumber: number;
  customers: Prisma.CustomerGetPayload<{}>[];
}

export function CreateInvoiceForm({
  email,
  address,
  lastName,
  firstName,
  customers,
  nextInvoiceNumber,
}: CreateInvoiceFormProps) {
  const [lastResult, action] = useActionState(createInvoice, undefined);
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: createInvoiceSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const [invoiceCode, setInvoiceCode] = useState<string>("");
  const [customerName, setCustomerName] = useState<string | undefined>();
  const [customerEmail, setCustomerEmail] = useState<string | undefined>();
  const [customerAddress, setCustomerAddress] = useState<string | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currency, setSelectedCurrency] = useState<"USD" | "EUR">("USD");
  const [selectedCustomer, setSelectedCustomer] = useState<
    string | undefined
  >();

  const amount = useMemo(() => {
    if (fields.invoiceItemQuantity.value && fields.invoiceItemRate.value)
      return (
        parseFloat(fields.invoiceItemQuantity.value) *
        parseFloat(fields.invoiceItemRate.value)
      );

    return 0;
  }, [fields.invoiceItemQuantity.value, fields.invoiceItemRate.value]);

  const onSelectCustomer = async (customerId: string) => {
    const customer = customers.find((customer) => customer.id === customerId)!;

    setSelectedCustomer(customerId);

    setCustomerName(customer.name);
    setCustomerEmail(customer.email);
    setCustomerAddress(customer.address);
    setInvoiceCode(customer.invoiceCode);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <form id={form.id} action={action} onSubmit={form.onSubmit} noValidate>
          <input type="hidden" name="invoiceCode" value={invoiceCode} />
          <div className="flex flex-col gap-1 w-fit mb-6">
            <div className="flex items-center gap-4">
              <Badge variant={"secondary"}>Draft</Badge>
              <Input
                placeholder="Test 123"
                key={fields.invoiceName.key}
                name={fields.invoiceName.name}
                defaultValue={fields.invoiceName.initialValue}
              />
            </div>
            <p className="text-red-500 text-sm">{fields.invoiceName.errors}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <Label>Customer</Label>
              <Select
                value={selectedCustomer}
                key={fields.customerId.key}
                name={fields.customerId.name}
                //@ts-ignore
                onValueChange={onSelectCustomer}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-red-500 text-sm">{fields.customerId.errors}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <Label>Invoice No.</Label>
              <div className="flex">
                <span className="px-3 border border-r-0 rounded-l-md bg-muted flex items-center w-20">
                  # {invoiceCode}
                </span>
                <Input
                  placeholder="5"
                  className="rounded-l-none"
                  key={fields.invoiceNumber.key}
                  name={fields.invoiceNumber.name}
                  defaultValue={nextInvoiceNumber}
                />
              </div>
              <p className="text-red-500 text-sm">
                {fields.invoiceNumber.errors}
              </p>
            </div>

            <div>
              <Label>Currency</Label>
              <Select
                defaultValue="USD"
                value={currency}
                key={fields.currency.key}
                name={fields.currency.name}
                //@ts-ignore
                onValueChange={setSelectedCurrency}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">
                    United State Dollar -- USD
                  </SelectItem>
                  <SelectItem value="EUR">Euro -- EUR</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-red-500 text-sm">{fields.currency.errors}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label>From</Label>
              <div className="space-y-2">
                <Input
                  placeholder="Your Name"
                  key={fields.fromName.key}
                  name={fields.fromName.name}
                  defaultValue={`${firstName} ${lastName}`}
                />
                <p className="text-red-500 text-sm">{fields.fromName.errors}</p>
                <Input
                  placeholder="Your Email"
                  key={fields.fromEmail.key}
                  name={fields.fromEmail.name}
                  defaultValue={email}
                />
                <p className="text-red-500 text-sm">
                  {fields.fromEmail.errors}
                </p>
                <Input
                  placeholder="Your Address"
                  key={fields.fromAddress.key}
                  name={fields.fromAddress.name}
                  defaultValue={address}
                />
                <p className="text-red-500 text-sm">
                  {fields.fromAddress.errors}
                </p>
              </div>
            </div>

            <div>
              <Label>To</Label>
              <div className="space-y-2">
                <Input
                  value={customerName || ""}
                  placeholder="Client Name"
                  key={fields.clientName.key}
                  name={fields.clientName.name}
                  defaultValue={fields.clientName.initialValue}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <p className="text-red-500 text-sm">
                  {fields.clientName.errors}
                </p>
                <Input
                  value={customerEmail || ""}
                  placeholder="Client Email"
                  key={fields.clientEmail.key}
                  name={fields.clientEmail.name}
                  defaultValue={fields.clientEmail.initialValue}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
                <p className="text-red-500 text-sm">
                  {fields.clientEmail.errors}
                </p>
                <Input
                  value={customerAddress || ""}
                  placeholder="Client Address"
                  key={fields.clientAddress.key}
                  name={fields.clientAddress.name}
                  defaultValue={fields.clientAddress.initialValue}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                />
                <p className="text-red-500 text-sm">
                  {fields.clientAddress.errors}
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <div>
                <Label>Date</Label>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-[280px] text-left justify-start"
                  >
                    <CalendarIcon />
                    {selectedDate ? (
                      <p>
                        {new Intl.DateTimeFormat("en-US", {
                          dateStyle: "long",
                        }).format(selectedDate)}
                      </p>
                    ) : (
                      <span>Pick a Date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    //@ts-ignore
                    mode="single"
                    //@ts-ignore
                    selected={selectedDate}
                    //@ts-ignore
                    onSelect={setSelectedDate}
                  />
                </PopoverContent>
              </Popover>
              <input
                type="hidden"
                name={fields.date.name}
                key={fields.date.key}
                value={selectedDate.toISOString()}
              />
              <p className="text-red-500 text-sm">{fields.date.errors}</p>
            </div>

            <div>
              <Label>Invoice Due</Label>
              <Select
                key={fields.dueDate.key}
                name={fields.dueDate.name}
                defaultValue={fields.dueDate.initialValue}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select due date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Due on Reciept</SelectItem>
                  <SelectItem value="15">Net 15</SelectItem>
                  <SelectItem value="30">Net 30</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-red-500 text-sm">{fields.dueDate.errors}</p>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-12 gap-4 mb-2 font-medium">
              <p className="col-span-6">Description</p>
              <p className="col-span-2">Quantity</p>
              <p className="col-span-2">Rate</p>
              <p className="col-span-2">Amount</p>
            </div>

            <div className="grid grid-cols-12 gap-4 mb-4">
              <div className="col-span-6">
                <Textarea
                  placeholder="Item name & description"
                  key={fields.invoiceItemDescription.key}
                  name={fields.invoiceItemDescription.name}
                  defaultValue={fields.invoiceItemDescription.initialValue}
                />
                <p className="text-red-500 text-sm">
                  {fields.invoiceItemDescription.errors}
                </p>
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  placeholder="0"
                  key={fields.invoiceItemQuantity.key}
                  name={fields.invoiceItemQuantity.name}
                />
                <p className="text-red-500 text-sm">
                  {fields.invoiceItemQuantity.errors}
                </p>
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  placeholder="0"
                  key={fields.invoiceItemRate.key}
                  name={fields.invoiceItemRate.name}
                />
                <p className="text-red-500 text-sm">
                  {fields.invoiceItemRate.errors}
                </p>
              </div>
              <div className="col-span-2">
                <Input
                  disabled
                  placeholder="0"
                  onChange={() => {}}
                  value={formatCurrency(amount, currency)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-1/3">
              <div className="flex justify-between py-2">
                <span>Subtotal</span>
                <span>{formatCurrency(amount, currency)}</span>
              </div>

              <div className="flex justify-between py-2 border-t">
                <span>{`Total (${currency})`}</span>
                <span className="font-bold">
                  {formatCurrency(amount, currency)}
                </span>
                <input type="hidden" name={fields.total.name} value={amount} />
              </div>
            </div>
          </div>

          <div>
            <Label>Note</Label>
            <Textarea
              key={fields.note.key}
              name={fields.note.name}
              defaultValue={fields.note.initialValue}
              placeholder="Add your Note/s right here..."
            />
            <p className="text-red-500 text-sm">{fields.note.errors}</p>
          </div>

          <div className="flex items-center justify-end mt-6">
            <div>
              <SubmitButton text="Send Invoice to Client" />
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
