import { InvoiceTableActions } from "./InvoiceTableActions";
import {
  Table,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  TableHeader,
} from "./ui/table";

export function InvoiceTable() {
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
        <TableRow>
          <TableCell>#1</TableCell>
          <TableCell>John Doe</TableCell>
          <TableCell>$55.00</TableCell>
          <TableCell>Paid</TableCell>
          <TableCell>22/11/2024</TableCell>
          <TableCell className="text-right">
            <InvoiceTableActions />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
