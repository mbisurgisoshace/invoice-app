import Link from "next/link";
import { FileInputIcon, FileOutputIcon, PlusIcon } from "lucide-react";

import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { InvoiceTable } from "@/components/InvoiceTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReceivedInvoiceTable } from "@/components/ReceivedInvoiceTable";

export default function Invoices() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Invoices</CardTitle>
            <CardDescription>
              Manage all your sent and received invoices from here
            </CardDescription>
          </div>

          <Link href="/dashboard/invoices/create" className={buttonVariants()}>
            <PlusIcon />
            Create Invoice
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {/* <InvoiceTable /> */}
        <Tabs defaultValue="sent">
          <TabsList>
            <TabsTrigger className="flex items-center gap-2" value="sent">
              Sent <FileInputIcon size={16} className="text-primary" />
            </TabsTrigger>
            <TabsTrigger className="flex items-center gap-2" value="received">
              Received
              <FileOutputIcon size={16} className="text-primary" />
            </TabsTrigger>
          </TabsList>
          <TabsContent value="sent">
            <InvoiceTable />
          </TabsContent>
          <TabsContent value="received">
            <ReceivedInvoiceTable />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
