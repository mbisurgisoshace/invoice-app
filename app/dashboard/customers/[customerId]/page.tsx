import { notFound } from "next/navigation";

import { prisma } from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
import { EditCustomerForm } from "@/components/EditCustomerForm";

export default async function Customer({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const session = await requireUser();

  const { customerId } = await params;

  const data = await prisma.customer.findUnique({
    where: {
      id: customerId,
      userId: session.user?.id,
    },
  });

  if (!data) return notFound();

  return <EditCustomerForm customer={JSON.parse(JSON.stringify(data))} />;
}
