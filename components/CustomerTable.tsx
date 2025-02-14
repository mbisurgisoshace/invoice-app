import { prisma } from "@/app/utils/db";
import {
  Table,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  TableHeader,
} from "./ui/table";
import { requireUser } from "@/app/utils/hooks";
import { CustomerTableActions } from "./CustomerTableActions";

export async function CustomerTable() {
  const session = await requireUser();

  const data = await prisma.customer.findMany({
    where: {
      userId: session.user?.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      phoneNumber: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Phone Number</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell>{customer.name}</TableCell>
            <TableCell>{customer.email}</TableCell>
            <TableCell>{customer.address}</TableCell>
            <TableCell>{customer.phoneNumber || "-"}</TableCell>
            <TableCell className="text-right">
              <CustomerTableActions customerId={customer.id} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
