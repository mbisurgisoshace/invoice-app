import {
  ActivityIcon,
  CheckCircle2Icon,
  ClockIcon,
  CreditCard,
  DollarSign,
  DollarSignIcon,
  FileTextIcon,
  UsersIcon,
} from "lucide-react";

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
        createdAt: {
          lte: new Date(),
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border-border/60 shadow-none transition-shadow hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {formatCurrency(
                  data.reduce((acc, invoice) => acc + Number(invoice.total), 0),
                  "USD",
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                Based on the last 30 days
              </p>
            </div>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10`}
            >
              <DollarSignIcon className={`h-5 w-5 text-primary`} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-none transition-shadow hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-muted-foreground">
                Invoices Issued
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {`${data.length}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {/* Total invoices issued */}
                Based on the last 30 days
              </p>
            </div>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10`}
            >
              <FileTextIcon className={`h-5 w-5 text-chart-4`} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-none transition-shadow hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-muted-foreground">
                Paid Invoices
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {`${paidInvoices.length}`}
              </p>
              <p className="text-xs text-muted-foreground">
                Total invoices paid
              </p>
            </div>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg bg-success/10`}
            >
              <CheckCircle2Icon className={`h-5 w-5 text-success`} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-none transition-shadow hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-muted-foreground">
                Pending
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {`${pendingInvoices.length}`}
              </p>
              <p className="text-xs text-muted-foreground">Currently pending</p>
            </div>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10`}
            >
              <ClockIcon className={`h-5 w-5 text-warning`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
