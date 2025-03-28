"use client";

import { Prisma } from "@prisma/client";
import {
  getInputProps,
  useField,
  useForm,
  useInputControl,
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useActionState, useState } from "react";
import { CalendarIcon, MinusIcon, XIcon } from "lucide-react";

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
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent } from "./ui/card";
import { SubmitButton } from "./SubmitButton";

import { calculateDiscountValue, formatCurrency } from "@/app/utils/utils";
import { createInvoice } from "@/app/actions/actions";
import { createInvoiceSchema } from "@/app/utils/schemas";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ImportedData, ImportTimesheetButton } from "./ImportTimesheetButton";

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
    defaultValue: {
      items: [
        {
          description: "",
          quantity: 0,
          rate: 0,
        },
      ],
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const [discount, setDiscount] = useState<string>("0");
  const [applyDiscount, setApplyDiscount] = useState(false);
  const [applySameRate, setApplySameRate] = useState(false);
  const [invoiceCode, setInvoiceCode] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [customerName, setCustomerName] = useState<string | undefined>();
  const [currency, setSelectedCurrency] = useState<"USD" | "EUR">("USD");
  const [discountType, setDiscountType] = useState<"FIXED" | "PERCENTAGE">(
    "FIXED"
  );
  const [customerEmail, setCustomerEmail] = useState<string | undefined>();
  const [customerAddress, setCustomerAddress] = useState<string | undefined>();
  const [selectedCustomer, setSelectedCustomer] = useState<
    string | undefined
  >();

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
      discountValue = calculateDiscountValue(
        subtotal,
        discountType,
        parseFloat(discount)
      );
    }

    return subtotal - discountValue;
  };

  const onImportData = (importedData: ImportedData[]) => {
    form.update({
      name: fields.items.name,
      value: importedData.map((data) => ({
        description: data.description,
        quantity: data.quantity,
        rate: 0,
      })),
    });
  };

  const onSwitchDiscountType = () => {
    if (discountType === "FIXED") {
      setDiscountType("PERCENTAGE");
    } else {
      setDiscountType("FIXED");
    }
  };

  const getRateValue = (
    rateValue: string | undefined,
    rateSetter: string | undefined
  ) => {
    if (!rateValue || rateValue === "0") {
      return rateSetter;
    }
    return rateValue;
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
              <p className="col-span-6 flex justify-between">
                <span className="flex ">
                  Description
                  <ImportTimesheetButton onImportData={onImportData} />
                </span>
                <span className="flex items-center space-x-2">
                  <Checkbox
                    id="apply-same-rate"
                    checked={applySameRate}
                    onCheckedChange={() => setApplySameRate(!applySameRate)}
                  />
                  <label
                    htmlFor="apply-same-rate"
                    className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Apply same rate
                  </label>
                </span>
              </p>
              <p className="col-span-2">Quantity</p>
              <p className="col-span-2">Rate</p>
              <p className="col-span-2">Amount</p>
            </div>

            {fields.items.getFieldList().map((item, index) => {
              const { description, quantity, rate } = item.getFieldset();

              let amount = 0;
              if (quantity.value && rate.value) {
                amount = parseFloat(quantity.value) * parseFloat(rate.value);
              }

              return (
                <div className="grid grid-cols-12 gap-4 mb-4" key={index}>
                  <div className="col-span-6">
                    <Textarea
                      placeholder="Item name & description"
                      //name={description.name}
                      {...getInputProps(description, { type: "text" })}
                      key={description.key}
                      //defaultValue={description.initialValue}
                    />
                    <p className="text-red-500 text-sm">{description.errors}</p>
                  </div>

                  <div className="col-span-2">
                    <Input
                      //type="number"
                      placeholder="0"
                      {...getInputProps(quantity, { type: "text" })}
                      key={quantity.key}
                      //name={quantity.name}
                    />
                    <p className="text-red-500 text-sm">{quantity.errors}</p>
                  </div>

                  <div className="col-span-2">
                    <Input
                      //type="number"
                      placeholder="0"
                      {...getInputProps(rate, { type: "text" })}
                      //name={rate.name}
                      key={rate.key}
                      onBlur={() => {
                        if (index === 0 && applySameRate && rate.value) {
                          fields.items.getFieldList().forEach((item, index) => {
                            if (index !== 0) {
                              const {
                                description,
                                quantity,
                                rate: rateToSet,
                              } = item.getFieldset();

                              form.update({
                                name: fields.items.name,
                                index,
                                value: {
                                  quantity: quantity.value,
                                  description: description.value,
                                  // rate: getRateValue(
                                  //   rateToSet.value,
                                  //   rate.value
                                  // ),
                                  rate: rate.value,
                                },
                              });
                            }
                          });
                        }
                      }}
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
                    <span className="mr-2">Discount</span>
                    <div className="flex items-center">
                      <span
                        onClick={onSwitchDiscountType}
                        className="size-9 font-semibold cursor-pointer flex items-center justify-center text-muted-foreground bg-slate-200 rounded-l-md"
                      >
                        {discountType === "FIXED" ? "$" : "%"}
                      </span>
                      <Input
                        //type="number"
                        placeholder="0"
                        value={discount}
                        className="w-full text-right rounded-r-md rounded-l-none"
                        onChange={(e) => setDiscount(e.target.value)}
                        {...getInputProps(fields.discount, { type: "text" })}
                        key={fields.discount.key}
                        //name={quantity.name}
                      />
                      <input
                        hidden
                        readOnly
                        value={discountType}
                        name={fields.discountType.name}
                      />
                    </div>
                    <Button
                      size="icon"
                      className="ml-2"
                      variant={"link"}
                      onClick={() => {
                        setDiscount("0");
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
