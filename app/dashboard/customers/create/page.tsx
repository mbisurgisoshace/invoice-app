import { DashboardLayout } from "@/components/AppLayout";
import { CreateCustomerForm } from "@/components/CreateCustomerForm";

export default async function CreateCustomer() {
  return (
    <DashboardLayout>
      <CreateCustomerForm />
    </DashboardLayout>
  );
}
