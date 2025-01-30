import { prisma } from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
import { CreateInvoiceForm } from "@/components/CreateInvoiceForm";

export default async function CreateInvoice() {
  const session = await requireUser();

  const data = await prisma.user.findUnique({
    where: {
      id: session.user?.id,
    },
    select: {
      firstName: true,
      lastName: true,
      address: true,
      email: true,
    },
  });

  return (
    <CreateInvoiceForm
      email={data?.email!}
      address={data?.address!}
      lastName={data?.lastName!}
      firstName={data?.firstName!}
    />
  );
}
