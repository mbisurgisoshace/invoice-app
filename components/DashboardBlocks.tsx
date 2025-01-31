import { ActivityIcon, CreditCard, DollarSign, UsersIcon } from "lucide-react";

import { prisma } from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { formatCurrency } from "@/app/utils/utils";

export async function DashboardBlocks() {
  const session = await requireUser();

  const [data, pendingInvoices, paidInvoices] = await Promise.all([
    prisma.invoice.findMany({
      where: {
        userId: session.user?.id,
      },
      select: {
        total: true,
      },
    }),
    prisma.invoice.findMany({
      where: {
        userId: session.user?.id,
        status: "PENDING",
      },
      select: {
        id: true,
      },
    }),
    prisma.invoice.findMany({
      where: {
        userId: session.user?.id,
        status: "PAID",
      },
      select: {
        id: true,
      },
    }),
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-bold">
            {formatCurrency(
              data.reduce((acc, invoice) => acc + Number(invoice.total), 0),
              "USD"
            )}
          </h2>
          <p className="text-xs text-muted-foreground">
            Based on the last 30 days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Invoices Issued
          </CardTitle>
          <UsersIcon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-bold">{`+${data.length}`}</h2>
          <p className="text-xs text-muted-foreground">Total invoices issued</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
          <CreditCard className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-bold">{`+${paidInvoices.length}`}</h2>
          <p className="text-xs text-muted-foreground">
            Total invoices which have been paid
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pending Invoices
          </CardTitle>
          <ActivityIcon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-bold">{`+${pendingInvoices.length}`}</h2>
          <p className="text-xs text-muted-foreground">
            Invoices which are currently pending
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
