"use server";

import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod";

import { prisma } from "../utils/db";
import { requireUser } from "../utils/hooks";
import { emailClient, sendEmail } from "../utils/mailtrap";
import {
  createCustomerSchema,
  createInvoiceSchema,
  onboardingSchema,
  updateInvoiceSchema,
} from "../utils/schemas";
import { formatCurrency, getInvoiceBalance } from "../utils/utils";
import { revalidatePath } from "next/cache";

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
      status:
        (submission.value.amountPaid ?? 0) >= submission.value.total
          ? "PAID"
          : submission.value.status,
      total: submission.value.total,
      discountType: submission.value.discountType,
      discount: submission.value.discount,
      amountPaid: submission.value.amountPaid ?? 0,
      note: submission.value.note,
      noteLabel: submission.value.noteLabel?.trim() || "Note",
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

  await sendEmail({
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
        submission.value.currency as any,
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
      status:
        (submission.value.amountPaid ?? 0) >= submission.value.total
          ? "PAID"
          : submission.value.status,
      total: submission.value.total,
      discountType: submission.value.discountType || null,
      discount: submission.value.discount || 0,
      amountPaid: submission.value.amountPaid ?? 0,
      note: submission.value.note,
      noteLabel: submission.value.noteLabel?.trim() || "Note",
      userId: session.user?.id,
      invoiceCode: submission.value.invoiceCode,
      customerId: submission.value.customerId,
      items: {
        deleteMany: {},
        create: submission.value.items,
      },
    },
  });

  await syncInvoiceStatus(data.id);

  const sender = {
    email: "hello@invoicely.dev",
    name: submission.value.fromName,
  };

  await sendEmail({
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
        submission.value.currency as any,
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

  revalidatePath("/dashboard/invoices");
  //return redirect("/dashboard/invoices");
}

export async function resendInvoice(invoiceId: string) {
  const session = await requireUser();

  const data = await prisma.invoice.findUniqueOrThrow({
    where: {
      id: invoiceId,
      userId: session.user?.id,
    },
    include: { customer: { select: { email: true } } },
  });

  // Not using sendEmail: errors should reach the UI since sending is the whole action.
  await emailClient.send({
    from: { email: "hello@invoicely.dev", name: data.fromName },
    // Customer's current email; the invoice's copy may be outdated.
    to: [{ email: data.customer?.email || data.clientEmail }],
    template_uuid: process.env.SEND_INVOICE_TEMPLATE_ID!,
    template_variables: {
      clientName: data.clientName,
      invoiceNumber: `# ${data.invoiceNumber}`,
      dueDate: new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
      }).format(new Date(data.date)),
      total: formatCurrency(Number(data.total), data.currency as any),
      invoiceLink: `${process.env.BASE_URL}/api/invoice/${data.id}`,
    },
  });
}

export async function markInvoiceAsPaid(
  invoiceId: string,
  paymentDate: string,
) {
  const session = await requireUser();

  const invoice = await prisma.invoice.findUniqueOrThrow({
    where: {
      id: invoiceId,
      userId: session.user?.id,
    },
    include: { payments: true },
  });

  const balance = getInvoiceBalance(invoice);

  if (balance > 0) {
    await prisma.invoicePayment.create({
      data: { invoiceId, amount: balance, date: paymentDate },
    });
  }

  await syncInvoiceStatus(invoiceId);

  revalidatePath("/dashboard/invoices");
  //return redirect("/dashboard/invoices");
}

export async function addInvoicePayment(
  invoiceId: string,
  amount: number,
  paymentDate: string,
  note?: string,
) {
  const session = await requireUser();

  if (!(amount > 0)) {
    throw new Error("Payment amount must be greater than 0");
  }

  await prisma.invoice.findUniqueOrThrow({
    where: {
      id: invoiceId,
      userId: session.user?.id,
    },
  });

  await prisma.invoicePayment.create({
    data: {
      invoiceId,
      amount,
      date: paymentDate,
      note: note?.trim() || null,
    },
  });

  await syncInvoiceStatus(invoiceId);

  revalidatePath("/dashboard/invoices");
}

export async function deleteInvoicePayment(paymentId: string) {
  const session = await requireUser();

  const payment = await prisma.invoicePayment.findFirstOrThrow({
    where: {
      id: paymentId,
      Invoice: { userId: session.user?.id },
    },
  });

  await prisma.invoicePayment.delete({ where: { id: payment.id } });

  await syncInvoiceStatus(payment.invoiceId);

  revalidatePath("/dashboard/invoices");
}

// Status is derived: PAID once the advance plus recorded payments cover the total.
async function syncInvoiceStatus(invoiceId: string) {
  const invoice = await prisma.invoice.findUniqueOrThrow({
    where: { id: invoiceId },
    include: { payments: { orderBy: { date: "desc" } } },
  });

  const isPaid = getInvoiceBalance(invoice) <= 0;

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: isPaid ? "PAID" : "PENDING",
      payedDate: isPaid
        ? (invoice.payments[0]?.date ?? invoice.payedDate ?? new Date())
        : null,
    },
  });
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

  revalidatePath("/dashboard/customers");
  //return redirect("/dashboard/customers");
}
