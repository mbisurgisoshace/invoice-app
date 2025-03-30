import jsPDF from "jspdf";
import { NextResponse } from "next/server";

import { prisma } from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
import {
  calculateDiscountValue,
  calculateInvoiceSubtotal,
  formatCurrency,
  paginateInvoiceLineItems,
} from "@/app/utils/utils";

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
      total: true,
      note: true,
      items: true,
      discount: true,
      discountType: true,
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

  const paginatedItems = paginateInvoiceLineItems(data.items, 10);

  const subtotal = calculateInvoiceSubtotal(data.items);

  paginatedItems.forEach((items, index) => {
    pdf.setFont("helvetica", "normal");

    if (index !== 0) {
      pdf.addPage();
    }

    // Header
    pdf.setFontSize(24);
    //pdf.text(data.invoiceName, 20, 20);
    pdf.text(`Invoice # ${data.invoiceCode} ${data.invoiceNumber}`, 20, 20);

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

    //Invoice Total
    pdf.setFont("helvetica", "bold");
    pdf.text(
      `Total (${data.currency}): ${formatCurrency(
        Number(data.total),
        data.currency as any
      )}`,
      120,
      55
    );

    // Invoice Items
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("Description", 20, 100);
    pdf.text("Quantity", 100, 100);
    pdf.text("Rate", 130, 100);
    pdf.text("Amount", 160, 100);

    pdf.line(20, 102, 190, 102);

    pdf.setFont("helvetica", "normal");

    let y = 110;
    const lineGap = 10;

    items.forEach((item, index) => {
      pdf.text(item.description, 20, y, { maxWidth: 75 });
      pdf.text(item.quantity.toString(), 100, y);
      pdf.text(formatCurrency(Number(item.rate), data.currency as any), 130, y);
      pdf.text(
        formatCurrency(
          Number(item.rate) * Number(item.quantity),
          data.currency as any
        ),
        160,
        y
      );

      y += lineGap;
    });

    // Total Section
    pdf.line(20, y, 190, y);

    if (index === paginatedItems.length - 1) {
      // Discount Section
      if (data.discount) {
        pdf.text(`Subtotal Before Discount`, 110, y + 10);

        pdf.text(
          formatCurrency(Number(subtotal), data.currency as any),
          160,
          y + 10
        );

        pdf.text(
          `Discount (${data.discountType === "FIXED" ? data.currency : "%"}) `,
          110,
          y + 20
        );

        pdf.text(
          formatCurrency(
            Number(
              calculateDiscountValue(
                subtotal,
                data.discountType!,
                Number(data.discount)
              )
            ),
            data.currency as any
          ),
          160,
          y + 20
        );

        pdf.setFont("helvetica", "bold");

        pdf.text(`Total After Discount`, 110, y + 30);

        pdf.text(
          formatCurrency(Number(data.total), data.currency as any),
          160,
          y + 30
        );
      }

      // Notes Section
      if (data.note) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.text("Note:", 20, y + 20);
        pdf.text(data.note, 20, y + 25);
      }
    }

    pdf.setFont("helvetica", "bold");

    pdf.text(`${index + 1} / ${paginatedItems.length}`, 20, 280);
  });

  // // Header
  // pdf.setFontSize(24);
  // //pdf.text(data.invoiceName, 20, 20);
  // pdf.text(`Invoice # ${data.invoiceCode} ${data.invoiceNumber}`, 20, 20);

  // // From Section
  // pdf.setFontSize(12);
  // pdf.text("From", 20, 40);
  // pdf.setFontSize(10);
  // pdf.text([data.fromName, data.fromEmail, data.fromAddress], 20, 45);

  // // Client Section
  // pdf.setFontSize(12);
  // pdf.text("Bill to", 20, 70);
  // pdf.setFontSize(10);
  // pdf.text([data.clientName, data.clientEmail, data.clientAddress], 20, 75);

  // // Invoice Details
  // pdf.setFontSize(10);
  // pdf.text(
  //   `Invoice Number: # ${data.invoiceCode} ${data.invoiceNumber}`,
  //   120,
  //   40
  // );
  // pdf.text(
  //   `Date: ${new Intl.DateTimeFormat("en-US", {
  //     dateStyle: "long",
  //   }).format(data.date)}`,
  //   120,
  //   45
  // );
  // pdf.text(`Due Date: Net ${data.dueDate}`, 120, 50);

  // //Invoice Total
  // pdf.setFont("helvetica", "bold");
  // pdf.text(
  //   `Total (${data.currency}): ${formatCurrency(
  //     Number(data.total),
  //     data.currency as any
  //   )}`,
  //   120,
  //   55
  // );

  // // Invoice Items
  // pdf.setFontSize(10);
  // pdf.setFont("helvetica", "bold");
  // pdf.text("Description", 20, 100);
  // pdf.text("Quantity", 100, 100);
  // pdf.text("Rate", 130, 100);
  // pdf.text("Amount", 160, 100);

  // pdf.line(20, 102, 190, 102);

  // pdf.setFont("helvetica", "normal");

  // let y = 110;
  // const lineGap = 10;

  // data.items.forEach((item, index) => {
  //   pdf.text(item.description, 20, y, { maxWidth: 75 });
  //   pdf.text(item.quantity.toString(), 100, y);
  //   pdf.text(formatCurrency(Number(item.rate), data.currency as any), 130, y);
  //   pdf.text(
  //     formatCurrency(
  //       Number(item.rate) * Number(item.quantity),
  //       data.currency as any
  //     ),
  //     160,
  //     y
  //   );

  //   y += lineGap;
  // });

  // // Total Section
  // pdf.line(
  //   20,
  //   115 + lineGap * (data.items.length - 1),
  //   190,
  //   115 + lineGap * (data.items.length - 1)
  // );
  // pdf.setFont("helvetica", "bold");

  // pdf.text(
  //   `${"1"} / ${paginatedItems.length}`,
  //   20,
  //   130 + lineGap * (data.items.length - 1)
  // );

  // pdf.text(
  //   `Total (${data.currency})`,
  //   130,
  //   130 + lineGap * (data.items.length - 1)
  // );
  // pdf.text(
  //   formatCurrency(Number(data.total), data.currency as any),
  //   160,
  //   130 + lineGap * (data.items.length - 1)
  // );

  // // Notes Section
  // if (data.note) {
  //   pdf.setFont("helvetica", "normal");
  //   pdf.setFontSize(10);
  //   pdf.text("Note:", 20, 150 + lineGap * (data.items.length - 1));
  //   pdf.text(data.note, 20, 155 + lineGap * (data.items.length - 1));
  // }

  const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
    },
  });
}
