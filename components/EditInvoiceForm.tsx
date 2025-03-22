"use client";

import { Prisma } from "@prisma/client";
import { CalendarIcon, MinusIcon, XIcon } from "lucide-react";
import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useActionState, useMemo, useState } from "react";

import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "./ui/select";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Calendar } from "./ui/calendar";
import { Card, CardContent } from "./ui/card";
import { SubmitButton } from "./SubmitButton";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

import { formatCurrency } from "@/app/utils/utils";
import { updateInvoice } from "@/app/actions/actions";
import { updateInvoiceSchema } from "@/app/utils/schemas";

interface EditInvoiceFormProps {
  customers: Prisma.CustomerGetPayload<{}>[];
  invoice: Prisma.InvoiceGetPayload<{ include: { items: true } }>;
}

export function EditInvoiceForm({ invoice, customers }: EditInvoiceFormProps) {
  const [lastResult, action] = useActionState(updateInvoice, undefined);
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: updateInvoiceSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    defaultValue: {
      items: invoice.items.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity as any,
        rate: item.rate as any,
      })),
    },
  });

  const [discount, setDiscount] = useState<string>(invoice.discount.toString());
  const [applyDiscount, setApplyDiscount] = useState(!!invoice.discount);
  const [invoiceCode, setInvoiceCode] = useState<string>(invoice.invoiceCode);
  const [customerName, setCustomerName] = useState<string>(invoice.clientName);
  const [customerEmail, setCustomerEmail] = useState<string>(
    invoice.clientEmail
  );
  const [customerAddress, setCustomerAddress] = useState<string>(
    invoice.clientAddress
  );
  const [selectedDate, setSelectedDate] = useState<Date>(
    new Date(invoice.date)
  );
  const [currency, setSelectedCurrency] = useState<"USD" | "EUR">(
    invoice.currency as any
  );
  const [selectedCustomer, setSelectedCustomer] = useState<string>(
    invoice.customerId!
  );

  const onSelectCustomer = async (customerId: string) => {
    const customer = customers.find((customer) => customer.id === customerId)!;

    setSelectedCustomer(customerId);

    setCustomerName(customer.name);
    setCustomerEmail(customer.email);
    setCustomerAddress(customer.address);
    setInvoiceCode(customer.invoiceCode);
  };

  const getTotalQuantity = () => {
    let total = 0;
    fields.items.getFieldList().forEach((item) => {
      const { quantity } = item.getFieldset();
      if (quantity.value) {
        total += parseFloat(quantity.value);
      }
    });

    return total;
  };

  const getSubTotal = () => {
    let total = 0;
    fields.items.getFieldList().forEach((item) => {
      const { quantity, rate } = item.getFieldset();
      if (quantity.value && rate.value) {
        total += parseFloat(quantity.value) * parseFloat(rate.value);
      }
    });

    return total;
  };

  const getTotal = () => {
    let discountValue = 0;
    const subtotal = getSubTotal();

    if (applyDiscount) {
      discountValue = parseFloat(discount);
    }

    return subtotal - discountValue;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <form id={form.id} action={action} onSubmit={form.onSubmit} noValidate>
          <input type="hidden" name="id" value={invoice.id} />
          <input type="hidden" name="invoiceCode" value={invoiceCode} />
          <div className="flex flex-col gap-1 w-fit mb-6">
            <div className="flex items-center gap-4">
              <Badge variant={"secondary"}>Draft</Badge>
              <Input
                placeholder="Test 123"
                key={fields.invoiceName.key}
                name={fields.invoiceName.name}
                defaultValue={invoice.invoiceName}
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
                  defaultValue={invoice.invoiceNumber}
                />
              </div>
              <p className="text-red-500 text-sm">
                {fields.invoiceNumber.errors}
              </p>
            </div>

            <div>
              <Label>Currency</Label>
              <Select
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
                  defaultValue={invoice.fromName}
                />
                <p className="text-red-500 text-sm">{fields.fromName.errors}</p>
                <Input
                  placeholder="Your Email"
                  key={fields.fromEmail.key}
                  name={fields.fromEmail.name}
                  defaultValue={invoice.fromEmail}
                />
                <p className="text-red-500 text-sm">
                  {fields.fromEmail.errors}
                </p>
                <Input
                  placeholder="Your Address"
                  key={fields.fromAddress.key}
                  name={fields.fromAddress.name}
                  defaultValue={invoice.fromAddress}
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
                  value={customerName}
                  placeholder="Client Name"
                  key={fields.clientName.key}
                  name={fields.clientName.name}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <p className="text-red-500 text-sm">
                  {fields.clientName.errors}
                </p>
                <Input
                  value={customerEmail}
                  placeholder="Client Email"
                  key={fields.clientEmail.key}
                  name={fields.clientEmail.name}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
                <p className="text-red-500 text-sm">
                  {fields.clientEmail.errors}
                </p>
                <Input
                  value={customerAddress}
                  placeholder="Client Address"
                  key={fields.clientAddress.key}
                  name={fields.clientAddress.name}
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
                defaultValue={invoice.dueDate.toString()}
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

            {fields.items.getFieldList().map((item, index) => {
              const { id, description, quantity, rate } = item.getFieldset();
              let amount = 0;
              if (quantity.value && rate.value) {
                amount = parseFloat(quantity.value) * parseFloat(rate.value);
              }

              return (
                <div className="grid grid-cols-12 gap-4 mb-4" key={index}>
                  <div className="col-span-6">
                    <Textarea
                      placeholder="Item name & description"
                      key={description.key}
                      name={description.name}
                      defaultValue={description.initialValue}
                    />
                    <p className="text-red-500 text-sm">{description.errors}</p>
                  </div>

                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="0"
                      key={quantity.key}
                      name={quantity.name}
                      defaultValue={quantity.initialValue}
                    />
                    <p className="text-red-500 text-sm">{quantity.errors}</p>
                  </div>

                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="0"
                      key={rate.key}
                      name={rate.name}
                      defaultValue={rate.initialValue}
                    />
                    <p className="text-red-500 text-sm">{rate.errors}</p>
                  </div>

                  <div className="col-span-2 flex gap-[2px]">
                    <Input
                      disabled
                      placeholder="0"
                      value={formatCurrency(amount, currency)}
                    />
                    <Button
                      variant={"ghost"}
                      size="icon"
                      {...form.remove.getButtonProps({
                        name: fields.items.name,
                        index,
                      })}
                    >
                      <MinusIcon className="text-primary" />
                    </Button>
                  </div>
                  {/* <input type="hidden" value={id.value} /> */}
                </div>
              );
            })}

            <div className="grid grid-cols-12 gap-4 mb-2 font-medium">
              <p className="col-span-6 text-right">Total Quantity</p>
              <p className="col-span-2 ">{getTotalQuantity().toFixed(2)}</p>
              <p className="col-span-2" />
              <p className="col-span-2" />
            </div>

            <Button
              variant={"default"}
              {...form.insert.getButtonProps({
                name: fields.items.name,
              })}
            >
              + Add Item
            </Button>
          </div>

          <div className="flex justify-end">
            <div className="w-1/3">
              <div className="flex justify-between py-2">
                <span>Subtotal</span>
                <span>{formatCurrency(getSubTotal(), currency)}</span>
              </div>

              <div>
                {!applyDiscount ? (
                  <Button
                    size={"sm"}
                    variant={"link"}
                    onClick={() => setApplyDiscount(!applyDiscount)}
                  >
                    + Discount
                  </Button>
                ) : (
                  <div className="flex  py-2 items-center">
                    <span>Discount</span>
                    <Input
                      placeholder="0"
                      value={discount}
                      className="ml-4 text-right"
                      onChange={(e) => setDiscount(e.target.value)}
                      {...getInputProps(fields.discount, { type: "text" })}
                      key={fields.discount.key}
                    />
                    <Button
                      size="icon"
                      className="ml-2"
                      variant={"link"}
                      onClick={() => {
                        setDiscount("0");
                        form.update({
                          name: fields.discount.name,
                          value: 1,
                        });
                        setApplyDiscount(!applyDiscount);
                      }}
                    >
                      <XIcon />
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex justify-between py-2 border-t">
                <span>{`Total (${currency})`}</span>
                <span className="font-bold">
                  {formatCurrency(getTotal(), currency)}
                </span>
                <input
                  type="hidden"
                  name={fields.total.name}
                  value={getTotal()}
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Note</Label>
            <Textarea
              key={fields.note.key}
              name={fields.note.name}
              defaultValue={invoice.note || ""}
              placeholder="Add your Note/s right here..."
            />
            <p className="text-red-500 text-sm">{fields.note.errors}</p>
          </div>

          <div className="flex items-center justify-end mt-6">
            <div>
              <SubmitButton text="Update Invoice" />
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
