import { requireUser } from "@/app/utils/hooks";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { prisma } from "@/app/utils/db";
import { formatCurrency } from "@/app/utils/utils";

export async function RecentInvoices() {
  const session = await requireUser();

  const data = await prisma.invoice.findMany({
    where: {
      userId: session.user?.id,
    },
    select: {
      id: true,
      clientName: true,
      clientEmail: true,
      total: true,
      currency: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 7,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Invoices</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        {data.map((invoice) => (
          <div className="flex items-center gap-4" key={invoice.id}>
            <Avatar className="hidden sm:flex size-9">
              <AvatarFallback>{invoice.clientName.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium leading-none">
                {invoice.clientName}
              </p>
              <p className="text-sm text-muted-foreground">
                {invoice.clientEmail}
              </p>
            </div>
            <div className="ml-auto font-medium">
              {formatCurrency(Number(invoice.total), invoice.currency as any)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
