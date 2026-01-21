import {
  Table,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  TableHeader,
} from "./ui/table";
import { Badge } from "./ui/badge";

import { prisma } from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
import { formatCurrency } from "@/app/utils/utils";
import { ReceivedInvoiceTableActions } from "./ReceivedInvoiceTableActions";

export async function ReceivedInvoiceTable() {
  const session = await requireUser();

  const data = await prisma.invoice.findMany({
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
          <TableRow key={invoice.id} className="h-[53px]">
            <TableCell>
              # {invoice.invoiceCode} {invoice.invoiceNumber}
            </TableCell>
            <TableCell>{invoice.fromName}</TableCell>
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
              <ReceivedInvoiceTableActions invoiceId={invoice.id} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
