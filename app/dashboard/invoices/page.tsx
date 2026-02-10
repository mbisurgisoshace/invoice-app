import Link from "next/link";
import { Plus } from "lucide-react";

import { prisma } from "@/app/utils/db";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/app/utils/hooks";
import { InvoicesTable } from "@/components/InvoiceTable";
import { formatCurrency } from "@/app/utils/utils";
import { DashboardLayout } from "@/components/AppLayout";

export default async function Invoices() {
  const session = await requireUser();

  const sentInvoices = await prisma.invoice.findMany({
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

  const receivedInvoices = await prisma.invoice.findMany({
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

  const formattedSentInvoices = sentInvoices.map((inv) => ({
    id: inv.id,
    invoiceName: inv.clientName,
    status: inv.status,
    amount: formatCurrency(Number(inv.total), inv.currency as any),
    date: new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
    }).format(inv.date),
    invoiceNumber: `${inv.invoiceCode} ${inv.invoiceNumber}`,
  }));

  const formattedReceivedInvoices = receivedInvoices.map((inv) => ({
    id: inv.id,
    invoiceName: inv.fromName,
    status: inv.status,
    amount: formatCurrency(Number(inv.total), inv.currency as any),
    date: new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
    }).format(inv.date),
    invoiceNumber: `${inv.invoiceCode} ${inv.invoiceNumber}`,
  }));

  return (
    <DashboardLayout fixedHeight>
      <div className="flex min-h-0 flex-1 flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Invoices
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage all your sent and received invoices
            </p>
          </div>
          <Button className="gap-2" asChild>
            <Link href="/dashboard/invoices/create">
              <Plus className="h-4 w-4" />
              Create Invoice
            </Link>
          </Button>
        </div>

        <InvoicesTable
          sentInvoices={formattedSentInvoices}
          receivedInvoices={formattedReceivedInvoices}
        />
      </div>
    </DashboardLayout>

    // <Card>
    //   <CardHeader>
    //     <div className="flex items-center justify-between">
    //       <div>
    //         <CardTitle className="text-2xl font-bold">Invoices</CardTitle>
    //         <CardDescription>
    //           Manage all your sent and received invoices from here
    //         </CardDescription>
    //       </div>

    //       <Link href="/dashboard/invoices/create" className={buttonVariants()}>
    //         <PlusIcon />
    //         Create Invoice
    //       </Link>
    //     </div>
    //   </CardHeader>
    //   <CardContent>
    //     {/* <InvoiceTable /> */}
    //     <Tabs defaultValue="sent">
    //       <TabsList>
    //         <TabsTrigger className="flex items-center gap-2" value="sent">
    //           Sent <FileInputIcon size={16} className="text-primary" />
    //         </TabsTrigger>
    //         <TabsTrigger className="flex items-center gap-2" value="received">
    //           Received
    //           <FileOutputIcon size={16} className="text-primary" />
    //         </TabsTrigger>
    //       </TabsList>
    //       <TabsContent value="sent">
    //         <InvoiceTable />
    //       </TabsContent>
    //       <TabsContent value="received">
    //         <ReceivedInvoiceTable />
    //       </TabsContent>
    //     </Tabs>
    //   </CardContent>
    // </Card>
  );
}
