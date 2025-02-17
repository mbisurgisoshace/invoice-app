import { prisma } from "@/app/utils/db";
import { InvoiceTableActions } from "./InvoiceTableActions";
import {
  Table,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  TableHeader,
} from "./ui/table";
import { requireUser } from "@/app/utils/hooks";
import { formatCurrency } from "@/app/utils/utils";
import { Badge } from "./ui/badge";

export async function InvoiceTable() {
  const session = await requireUser();

  const data = await prisma.invoice.findMany({
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
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell>
              # {invoice.invoiceCode} {invoice.invoiceNumber}
            </TableCell>
            <TableCell>{invoice.clientName}</TableCell>
            <TableCell>
              {formatCurrency(Number(invoice.total), invoice.currency as any)}
            </TableCell>
            <TableCell>
              <Badge
                variant={invoice.status === "PAID" ? "success" : "warning"}
              >
                {invoice.status}
              </Badge>
            </TableCell>
            <TableCell>
              {new Intl.DateTimeFormat("en-US", {
                dateStyle: "medium",
              }).format(invoice.date)}
            </TableCell>
            <TableCell className="text-right">
              <InvoiceTableActions
                invoiceId={invoice.id}
                status={invoice.status}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
