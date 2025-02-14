import { prisma } from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
import { CreateInvoiceForm } from "@/components/CreateInvoiceForm";

export default async function CreateInvoice() {
  const session = await requireUser();

  const [data, customers] = await Promise.all([
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
  ]);

  return (
    <CreateInvoiceForm
      email={data?.email!}
      address={data?.address!}
      lastName={data?.lastName!}
      firstName={data?.firstName!}
      customers={JSON.parse(JSON.stringify(customers))}
    />
  );
}
