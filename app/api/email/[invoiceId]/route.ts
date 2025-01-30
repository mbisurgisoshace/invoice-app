import { NextResponse } from "next/server";

import { prisma } from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
import { emailClient } from "@/app/utils/mailtrap";

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ invoiceId: string }>;
  }
) {
  try {
    const session = await requireUser();

    const { invoiceId } = await params;

    const data = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
        userId: session.user?.id,
      },
    });

    if (!data)
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    const sender = {
      email: "hello@demomailtrap.com",
      name: "Maximiliano Bisurgi",
    };

    emailClient.send({
      from: sender,
      to: [{ email: "maximiliano.bisurgi@gmail.com" }],
      template_uuid: "d9a3011d-9489-4e6e-a28a-63936f59c955",
      template_variables: {
        first_name: data.clientName,
        company_info_name: "Invoice App",
        company_info_address: "Street 123",
        company_info_city: "Orlando",
        company_info_zip_code: "10036",
        company_info_country: "USA",
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to send Email remainder" },
      { status: 500 }
    );
  }
}
