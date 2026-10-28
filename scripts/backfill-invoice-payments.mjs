// One-off: invoices marked as PAID before partial payments existed have no
// payment rows, so their balance would look unpaid. This creates a single
// payment for the remaining balance, dated on the invoice's payedDate.
// Safe to run more than once: invoices that already have payments are skipped.
//
// Usage: node scripts/backfill-invoice-payments.mjs [--dry-run]

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");

const invoices = await prisma.invoice.findMany({
  where: { status: "PAID", payments: { none: {} } },
});

let created = 0;

for (const invoice of invoices) {
  const balance =
    Math.round((Number(invoice.total) - Number(invoice.amountPaid)) * 100) /
    100;

  if (balance <= 0) continue;

  console.log(
    `${invoice.invoiceCode} ${invoice.invoiceNumber}: ${balance} ${invoice.currency}`,
  );

  if (!dryRun) {
    await prisma.invoicePayment.create({
      data: {
        invoiceId: invoice.id,
        amount: balance,
        date: invoice.payedDate ?? invoice.updatedAt,
      },
    });
  }

  created++;
}

console.log(
  `${dryRun ? "[dry run] would create" : "Created"} ${created} payment(s).`,
);

await prisma.$disconnect();
