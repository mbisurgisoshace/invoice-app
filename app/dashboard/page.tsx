import { requireUser } from "../utils/hooks";
import { InvoiceChart } from "@/components/InvoiceChart";
import { RecentInvoices } from "@/components/RecentInvoices";
import { DashboardBlocks } from "@/components/DashboardBlocks";

export default async function Dashboard() {
  const session = await requireUser();

  return (
    <>
      <DashboardBlocks />
      <div className="grid gap-4 lg:grid-cols-3 md:gap-8">
        <InvoiceChart />
        <RecentInvoices />
      </div>
    </>
  );
}
