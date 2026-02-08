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
      status: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 7,
  });

  return (
    <Card className="border-border/60 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground">
          Recent Invoices
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-4">
        <div className="flex flex-col gap-4">
          {data.map((invoice) => (
            <div className="flex items-center gap-3" key={invoice.id}>
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                  {invoice.clientName
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 truncate">
                <p className="truncate text-sm font-medium text-foreground">
                  {invoice.clientName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {invoice.clientEmail}
                </p>
              </div>

              <div className="flex flex-col items-end gap-0.5">
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  {formatCurrency(
                    Number(invoice.total),
                    invoice.currency as any,
                  )}
                </span>
                <span
                  className={`text-[10px] font-medium uppercase tracking-wider ${
                    invoice.status === "PAID" ? "text-success" : "text-warning"
                  }`}
                >
                  {invoice.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
