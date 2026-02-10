import { requireUser } from "../utils/hooks";
import { InvoiceChart } from "@/components/InvoiceChart";
import { RecentInvoices } from "@/components/RecentInvoices";
import { DashboardBlocks } from "@/components/DashboardBlocks";
import { DashboardLayout } from "@/components/AppLayout";

export default async function Dashboard() {
  const session = await requireUser();

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of your invoicing activity
          </p>
        </div>

        <DashboardBlocks />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <InvoiceChart />
          </div>
          <div className="lg:col-span-2">
            <RecentInvoices />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
