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
      total: true,
      status: true,
      currency: true,
      createdAt: true,
      clientName: true,
      invoiceNumber: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  console.log("data", data);

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
            <TableCell># {invoice.invoiceNumber}</TableCell>
            <TableCell>{invoice.clientName}</TableCell>
            <TableCell>
              {formatCurrency(Number(invoice.total), invoice.currency as any)}
            </TableCell>
            <TableCell>
              <Badge>{invoice.status}</Badge>
            </TableCell>
            <TableCell>
              {new Intl.DateTimeFormat("en-US", {
                dateStyle: "medium",
              }).format(invoice.createdAt)}
            </TableCell>
            <TableCell className="text-right">
              <InvoiceTableActions />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
