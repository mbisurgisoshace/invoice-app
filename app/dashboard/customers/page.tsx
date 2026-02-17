import Link from "next/link";
import { Plus } from "lucide-react";

import { prisma } from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/AppLayout";
import { CustomerTable } from "@/components/CustomerTable";

export default async function Customers() {
  const session = await requireUser();

  const customers = await prisma.customer.findMany({
    where: {
      userId: session.user?.id,
      archived: false,
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

  const formattedCustomers = customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    address: customer.address,
    phoneNumber: customer.phoneNumber,
  }));

  return (
    <DashboardLayout fixedHeight>
      <div className="flex min-h-0 flex-1 flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Customers
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage all your customers
            </p>
          </div>
          <Button className="gap-2" asChild>
            <Link href="/dashboard/customers/create">
              <Plus className="h-4 w-4" />
              Create Customer
            </Link>
          </Button>
        </div>

        <CustomerTable customers={formattedCustomers} />
      </div>
    </DashboardLayout>
  );
}
