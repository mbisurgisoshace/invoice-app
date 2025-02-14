import jsPDF from "jspdf";
import { NextResponse } from "next/server";

import { prisma } from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
import { formatCurrency } from "@/app/utils/utils";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ invoiceId: string }>;
  }
) {
  const { invoiceId } = await params;

  const data = await prisma.invoice.findUnique({
    where: {
      id: invoiceId,
    },
    select: {
      invoiceName: true,
      invoiceCode: true,
      invoiceNumber: true,
      currency: true,
      fromName: true,
      fromEmail: true,
      fromAddress: true,
      clientName: true,
      clientEmail: true,
      clientAddress: true,
      date: true,
      dueDate: true,
      invoiceItemDescription: true,
      invoiceItemQuantity: true,
      invoiceItemRate: true,
      total: true,
      note: true,
    },
  });

  if (!data) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  pdf.setFont("helvetica");

  // Header
  pdf.setFontSize(24);
  pdf.text(data.invoiceName, 20, 20);

  // From Section
  pdf.setFontSize(12);
  pdf.text("From", 20, 40);
  pdf.setFontSize(10);
  pdf.text([data.fromName, data.fromEmail, data.fromAddress], 20, 45);

  // Client Section
  pdf.setFontSize(12);
  pdf.text("Bill to", 20, 70);
  pdf.setFontSize(10);
  pdf.text([data.clientName, data.clientEmail, data.clientAddress], 20, 75);

  // Invoice Details
  pdf.setFontSize(10);
  pdf.text(
    `Invoice Number: # ${data.invoiceCode} ${data.invoiceNumber}`,
    120,
    40
  );
  pdf.text(
    `Date: ${new Intl.DateTimeFormat("en-US", {
      dateStyle: "long",
    }).format(data.date)}`,
    120,
    45
  );
  pdf.text(`Due Date: Net ${data.dueDate}`, 120, 50);

  // Invoice Items
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("Description", 20, 100);
  pdf.text("Quantity", 100, 100);
  pdf.text("Rate", 130, 100);
  pdf.text("Amount", 160, 100);

  pdf.line(20, 102, 190, 102);

  pdf.setFont("helvetica", "normal");
  pdf.text(data.invoiceItemDescription, 20, 110);
  pdf.text(data.invoiceItemQuantity.toString(), 100, 110);
  pdf.text(
    formatCurrency(Number(data.invoiceItemRate), data.currency as any),
    130,
    110
  );
  pdf.text(formatCurrency(Number(data.total), data.currency as any), 160, 110);

  // Total Section
  pdf.line(20, 115, 190, 115);
  pdf.setFont("helvetica", "bold");
  pdf.text(`Total (${data.currency})`, 130, 130);
  pdf.text(formatCurrency(Number(data.total), data.currency as any), 160, 130);

  // Notes Section
  if (data.note) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text("Note:", 20, 150);
    pdf.text(data.note, 20, 155);
  }

  const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
    },
  });
}
