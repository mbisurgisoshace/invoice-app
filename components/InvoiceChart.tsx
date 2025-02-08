import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "./ui/card";
import { Chart } from "./Chart";
import { requireUser } from "@/app/utils/hooks";
import { prisma } from "@/app/utils/db";

export async function InvoiceChart() {
  const session = await requireUser();
  const rawData = await prisma.invoice.findMany({
    where: {
      userId: session.user?.id,
      status: "PAID",
      createdAt: {
        lte: new Date(),
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
    select: {
      total: true,
      payedDate: true,
    },
    orderBy: {
      payedDate: "asc",
    },
  });

  const aggregatedData = rawData.reduce(
    (acc: { [key: string]: number }, curr) => {
      const date = new Date(curr.payedDate!).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      acc[date] = (acc[date] || 0) + Number(curr.total);

      return acc;
    },
    {}
  );

  const aggregatedDataArray = Object.entries(aggregatedData)
    .map(([date, amount]) => ({
      date,
      amount,
      originalDate: new Date(date + ", " + new Date().getFullYear()),
    }))
    .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime())
    .map(({ date, amount }) => ({ date, amount }));

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Paid Invoices</CardTitle>
        <CardDescription>
          Invoices which have been paid in the last 30 days.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Chart data={aggregatedDataArray} />
      </CardContent>
    </Card>
  );
}
