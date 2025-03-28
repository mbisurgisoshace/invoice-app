"use server";

import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod";

import { prisma } from "../utils/db";
import { requireUser } from "../utils/hooks";
import { emailClient } from "../utils/mailtrap";
import {
  createCustomerSchema,
  createInvoiceSchema,
  onboardingSchema,
  updateInvoiceSchema,
} from "../utils/schemas";
import { formatCurrency } from "../utils/utils";

export async function onboardUser(prevState: any, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: onboardingSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const data = await prisma.user.update({
    where: { id: session.user?.id },
    data: {
      firstName: submission.value.firstName,
      lastName: submission.value.lastName,
      address: submission.value.address,
    },
  });

  return redirect("/dashboard");
}

export async function createInvoice(prevState: any, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: createInvoiceSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const data = await prisma.invoice.create({
    data: {
      clientAddress: submission.value.clientAddress,
      clientEmail: submission.value.clientEmail,
      clientName: submission.value.clientName,
      currency: submission.value.currency,
      date: submission.value.date,
      dueDate: submission.value.dueDate,
      fromAddress: submission.value.fromAddress,
      fromEmail: submission.value.fromEmail,
      fromName: submission.value.fromName,
      invoiceName: submission.value.invoiceName,
      invoiceNumber: submission.value.invoiceNumber,
      status: submission.value.status,
      total: submission.value.total,
      discountType: submission.value.discountType,
      discount: submission.value.discount,
      note: submission.value.note,
      userId: session.user?.id,
      invoiceCode: submission.value.invoiceCode,
      customerId: submission.value.customerId,
      items: {
        create: submission.value.items,
      },
    },
  });

  const sender = {
    email: "hello@invoicely.dev",
    name: submission.value.fromName,
  };

  emailClient.send({
    from: sender,
    to: [{ email: submission.value.clientEmail }],
    template_uuid: process.env.SEND_INVOICE_TEMPLATE_ID!,
    template_variables: {
      clientName: submission.value.clientName,
      invoiceNumber: `# ${submission.value.invoiceNumber}`,
      dueDate: new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
      }).format(new Date(submission.value.date)),
      total: formatCurrency(
        Number(submission.value.total),
        submission.value.currency as any
      ),
      invoiceLink: `${process.env.BASE_URL}/api/invoice/${data.id}`,
    },
  });

  return redirect("/dashboard/invoices");
}

export async function updateInvoice(prevState: any, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: updateInvoiceSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const data = await prisma.invoice.update({
    where: {
      id: formData.get("id") as string,
      userId: session.user?.id,
    },
    data: {
      clientAddress: submission.value.clientAddress,
      clientEmail: submission.value.clientEmail,
      clientName: submission.value.clientName,
      currency: submission.value.currency,
      date: submission.value.date,
      dueDate: submission.value.dueDate,
      fromAddress: submission.value.fromAddress,
      fromEmail: submission.value.fromEmail,
      fromName: submission.value.fromName,
      invoiceName: submission.value.invoiceName,
      invoiceNumber: submission.value.invoiceNumber,
      status: submission.value.status,
      total: submission.value.total,
      discountType: submission.value.discountType,
      discount: submission.value.discount || 0,
      note: submission.value.note,
      userId: session.user?.id,
      invoiceCode: submission.value.invoiceCode,
      customerId: submission.value.customerId,
      items: {
        deleteMany: {},
        create: submission.value.items,
      },
    },
  });

  const sender = {
    email: "hello@invoicely.dev",
    name: submission.value.fromName,
  };

  emailClient.send({
    from: sender,
    to: [{ email: submission.value.clientEmail }],
    template_uuid: process.env.EDIT_INVOICE_TEMPLATE_ID!,
    template_variables: {
      clientName: submission.value.clientName,
      invoiceNumber: `# ${submission.value.invoiceNumber}`,
      dueDate: new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
      }).format(new Date(submission.value.date)),
      total: formatCurrency(
        Number(submission.value.total),
        submission.value.currency as any
      ),
      invoiceLink: `${process.env.BASE_URL}/api/invoice/${data.id}`,
    },
  });

  return redirect("/dashboard/invoices");
}

export async function deleteInvoice(invoiceId: string) {
  const session = await requireUser();

  const data = await prisma.invoice.delete({
    where: {
      id: invoiceId,
      userId: session.user?.id,
    },
  });

  return redirect("/dashboard/invoices");
}

export async function markInvoiceAsPaid(
  invoiceId: string,
  paymentDate: string
) {
  const session = await requireUser();

  const data = await prisma.invoice.update({
    where: {
      id: invoiceId,
      userId: session.user?.id,
    },
    data: {
      status: "PAID",
      payedDate: paymentDate,
    },
  });

  return redirect("/dashboard/invoices");
}

export async function getLastInvoiceNumber() {
  const session = await requireUser();

  const data = await prisma.invoice.findFirst({
    where: {
      userId: session.user?.id,
    },
    orderBy: {
      invoiceNumber: "desc",
    },
  });

  return data?.invoiceNumber || 0;
}

export async function createCustomer(prevState: any, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: createCustomerSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const data = await prisma.customer.create({
    data: {
      address: submission.value.address,
      email: submission.value.email,
      name: submission.value.name,
      phoneNumber: submission.value.phoneNumber,
      taxNumber: submission.value.taxNumber,
      invoiceCode: submission.value.invoiceCode,
      userId: session.user?.id,
    },
  });

  return redirect("/dashboard/customers");
}

export async function updateCustomer(prevState: any, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: createCustomerSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const data = await prisma.customer.update({
    where: {
      id: formData.get("id") as string,
      userId: session.user?.id,
    },
    data: {
      address: submission.value.address,
      email: submission.value.email,
      name: submission.value.name,
      phoneNumber: submission.value.phoneNumber,
      taxNumber: submission.value.taxNumber,
      invoiceCode: submission.value.invoiceCode,
      userId: session.user?.id,
    },
  });

  return redirect("/dashboard/customers");
}

export async function archiveCustomer(customerId: string) {
  const session = await requireUser();

  const data = await prisma.customer.update({
    where: {
      id: customerId,
      userId: session.user?.id,
    },
    data: {
      archived: true,
    },
  });

  return redirect("/dashboard/customers");
}
