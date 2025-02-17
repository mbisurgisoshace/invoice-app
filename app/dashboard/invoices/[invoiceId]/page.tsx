import { notFound } from "next/navigation";

import { prisma } from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
import { EditInvoiceForm } from "@/components/EditInvoiceForm";

export default async function Invoice({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const session = await requireUser();

  const { invoiceId } = await params;

  const [data, customers] = await Promise.all([
    await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
        userId: session.user?.id,
      },
      include: {
        items: true,
      },
    }),
    await prisma.customer.findMany({
      where: {
        userId: session.user?.id,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  if (!data) return notFound();

  return (
    <EditInvoiceForm
      invoice={JSON.parse(JSON.stringify(data))}
      customers={JSON.parse(JSON.stringify(customers))}
    />
  );
}
