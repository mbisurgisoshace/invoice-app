import Link from "next/link";
import { PlusIcon } from "lucide-react";

import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { InvoiceTable } from "@/components/InvoiceTable";
import { CustomerTable } from "@/components/CustomerTable";

export default function Customers() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Customers</CardTitle>
            <CardDescription>Manage your customers right here</CardDescription>
          </div>

          <Link href="/dashboard/customers/create" className={buttonVariants()}>
            <PlusIcon />
            Create Customer
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <CustomerTable />
      </CardContent>
    </Card>
  );
}
