"use server";

import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod";

import { prisma } from "../utils/db";
import { requireUser } from "../utils/hooks";
import { emailClient } from "../utils/mailtrap";
import { createInvoiceSchema, onboardingSchema } from "../utils/schemas";
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
      invoiceItemDescription: submission.value.invoiceItemDescription,
      invoiceItemQuantity: submission.value.invoiceItemQuantity,
      invoiceItemRate: submission.value.invoiceItemRate,
      invoiceName: submission.value.invoiceName,
      invoiceNumber: submission.value.invoiceNumber,
      status: submission.value.status,
      total: submission.value.total,
      note: submission.value.note,
      userId: session.user?.id,
    },
  });

  const sender = {
    email: "hello@demomailtrap.com",
    name: "Maximiliano Bisurgi",
  };

  emailClient.send({
    from: sender,
    to: [{ email: "maximiliano.bisurgi@gmail.com" }],
    template_uuid: "7b5d687c-ef69-4f42-a766-d68acde418d9",
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
      invoiceLink: `http://localhost:3000/api/invoice/${data.id}`,
    },
  });

  return redirect("/dashboard/invoices");
}

export async function updateInvoice(prevState: any, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: createInvoiceSchema,
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
      invoiceItemDescription: submission.value.invoiceItemDescription,
      invoiceItemQuantity: submission.value.invoiceItemQuantity,
      invoiceItemRate: submission.value.invoiceItemRate,
      invoiceName: submission.value.invoiceName,
      invoiceNumber: submission.value.invoiceNumber,
      status: submission.value.status,
      total: submission.value.total,
      note: submission.value.note,
      userId: session.user?.id,
    },
  });

  const sender = {
    email: "hello@demomailtrap.com",
    name: "Maximiliano Bisurgi",
  };

  emailClient.send({
    from: sender,
    to: [{ email: "maximiliano.bisurgi@gmail.com" }],
    template_uuid: "bd02ff8a-11bc-4e9d-9675-0ba46c3344bc",
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
      invoiceLink: `http://localhost:3000/api/invoice/${data.id}`,
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

export async function markInvoiceAsPaid(invoiceId: string) {
  const session = await requireUser();

  const data = await prisma.invoice.update({
    where: {
      id: invoiceId,
      userId: session.user?.id,
    },
    data: {
      status: "PAID",
    },
  });

  return redirect("/dashboard/invoices");
}
