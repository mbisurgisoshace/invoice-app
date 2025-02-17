import { z } from "zod";

export const onboardingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Address is required"),
});

export const createInvoiceSchema = z.object({
  invoiceName: z.string().min(1, "Invoice name is required"),
  total: z.number().min(1, "1$ is minimum"),
  status: z.enum(["PAID", "PENDING"]).default("PENDING"),
  date: z.string().min(1, "Date is required"),
  dueDate: z.number().min(0, "Due date is required"),
  fromName: z.string().min(1, "From name is required"),
  fromEmail: z.string().email("Invalid email address"),
  fromAddress: z.string().min(1, "From address is required"),
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Invalid email address"),
  clientAddress: z.string().min(1, "Client address is required"),
  currency: z.string().min(1, "Currency is required"),
  invoiceNumber: z.number().min(1, "Minimum invoice number of 1"),
  note: z.string().optional(),
  customerId: z.string().min(1, "Customer is required"),
  invoiceCode: z
    .string()
    .min(1, "Invoice code is required and must be at least 2 characters "),
  items: z.array(
    z.object({
      description: z.string().min(1, "Description is required"),
      quantity: z.number().min(1, "Quantity minimum is 1"),
      rate: z.number().min(1, "Rate minimum is 1"),
    })
  ),
});

export const updateInvoiceSchema = z.object({
  invoiceName: z.string().min(1, "Invoice name is required"),
  total: z.number().min(1, "1$ is minimum"),
  status: z.enum(["PAID", "PENDING"]).default("PENDING"),
  date: z.string().min(1, "Date is required"),
  dueDate: z.number().min(0, "Due date is required"),
  fromName: z.string().min(1, "From name is required"),
  fromEmail: z.string().email("Invalid email address"),
  fromAddress: z.string().min(1, "From address is required"),
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Invalid email address"),
  clientAddress: z.string().min(1, "Client address is required"),
  currency: z.string().min(1, "Currency is required"),
  invoiceNumber: z.number().min(1, "Minimum invoice number of 1"),
  note: z.string().optional(),
  customerId: z.string().min(1, "Customer is required"),
  invoiceCode: z
    .string()
    .min(1, "Invoice code is required and must be at least 2 characters "),
  items: z.array(
    z.object({
      id: z.string().optional(),
      description: z.string().min(1, "Description is required"),
      quantity: z.number().min(1, "Quantity minimum is 1"),
      rate: z.number().min(1, "Rate minimum is 1"),
    })
  ),
});

export const createCustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(1, "Address is required"),
  taxNumber: z.string().optional(),
  phoneNumber: z.string().optional(),
  invoiceCode: z
    .string()
    .min(2, "Invoice code is required and must be at least 2 characters "),
});
