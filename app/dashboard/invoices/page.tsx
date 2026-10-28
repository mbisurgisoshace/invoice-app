import Link from "next/link";
import { Plus } from "lucide-react";
import { Prisma } from "@prisma/client";

import { prisma } from "@/app/utils/db";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/app/utils/hooks";
import { InvoicesTable } from "@/components/InvoiceTable";
import { formatCurrency, getInvoiceBalance } from "@/app/utils/utils";
import { DashboardLayout } from "@/components/AppLayout";

function formatPayments(inv: {
  total: Prisma.Decimal;
  currency: string;
  amountPaid: Prisma.Decimal;
  payments: {
    id: string;
    amount: Prisma.Decimal;
    date: Date;
    note: string | null;
  }[];
}) {
  const balance = Math.max(getInvoiceBalance(inv), 0);

  return {
    balance,
    pendingAmount: formatCurrency(balance, inv.currency as any),
    hasPayments: inv.payments.length > 0,
    payments: inv.payments.map((payment) => ({
      id: payment.id,
      note: payment.note,
      amount: formatCurrency(Number(payment.amount), inv.currency as any),
      date: new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
      }).format(payment.date),
    })),
  };
}

export default async function Invoices() {
  const session = await requireUser();

  const sentInvoices = await prisma.invoice.findMany({
    where: {
      userId: session.user?.id,
    },
    select: {
      id: true,
      date: true,
      total: true,
      status: true,
      currency: true,
      createdAt: true,
      clientName: true,
      invoiceCode: true,
      invoiceNumber: true,
      amountPaid: true,
      payments: {
        select: { id: true, amount: true, date: true, note: true },
        orderBy: { date: "asc" },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const receivedInvoices = await prisma.invoice.findMany({
    where: {
      clientEmail: session?.user?.email || "",
    },
    select: {
      id: true,
      date: true,
      total: true,
      status: true,
      fromName: true,
      currency: true,
      createdAt: true,
      clientName: true,
      invoiceCode: true,
      invoiceNumber: true,
      amountPaid: true,
      payments: {
        select: { id: true, amount: true, date: true, note: true },
        orderBy: { date: "asc" },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedSentInvoices = sentInvoices.map((inv) => ({
    id: inv.id,
    invoiceName: inv.clientName,
    status: inv.status,
    amount: formatCurrency(Number(inv.total), inv.currency as any),
    date: new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
    }).format(inv.date),
    invoiceNumber: `${inv.invoiceCode} ${inv.invoiceNumber}`,
    ...formatPayments(inv),
  }));

  const formattedReceivedInvoices = receivedInvoices.map((inv) => ({
    id: inv.id,
    invoiceName: inv.fromName,
    status: inv.status,
    amount: formatCurrency(Number(inv.total), inv.currency as any),
    date: new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
    }).format(inv.date),
    invoiceNumber: `${inv.invoiceCode} ${inv.invoiceNumber}`,
    ...formatPayments(inv),
  }));

  return (
    <DashboardLayout fixedHeight>
      <div className="flex min-h-0 flex-1 flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Invoices
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage all your sent and received invoices
            </p>
          </div>
          <Button className="gap-2" asChild>
            <Link href="/dashboard/invoices/create">
              <Plus className="h-4 w-4" />
              Create Invoice
            </Link>
          </Button>
        </div>

        <InvoicesTable
          sentInvoices={formattedSentInvoices}
          receivedInvoices={formattedReceivedInvoices}
        />
      </div>
    </DashboardLayout>
  );
}
