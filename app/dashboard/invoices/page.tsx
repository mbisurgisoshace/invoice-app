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

export default function Invoices() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Invoices</CardTitle>
            <CardDescription>Manage your invoces right here</CardDescription>
          </div>

          <Link href="/dashboard/invoices/create" className={buttonVariants()}>
            <PlusIcon />
            Create Invoice
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <InvoiceTable />
      </CardContent>
    </Card>
  );
}
