import { prisma } from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
import { CreateInvoiceForm } from "@/components/CreateInvoiceForm";

export default async function CreateInvoice() {
  const session = await requireUser();

  const [data, customers, lastInvoiceNumber] = await Promise.all([
    await prisma.user.findUnique({
      where: {
        id: session.user?.id,
      },
      select: {
        firstName: true,
        lastName: true,
        address: true,
        email: true,
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
    await prisma.invoice.findFirst({
      where: {
        userId: session.user?.id,
      },
      select: {
        invoiceNumber: true,
      },
      orderBy: {
        invoiceNumber: "desc",
      },
    }),
  ]);

  const nextInvoiceNumber = (lastInvoiceNumber?.invoiceNumber || 0) + 1;

  return (
    <CreateInvoiceForm
      email={data?.email!}
      address={data?.address!}
      lastName={data?.lastName!}
      firstName={data?.firstName!}
      nextInvoiceNumber={nextInvoiceNumber}
      customers={JSON.parse(JSON.stringify(customers))}
    />
  );
}
