import { InvoiceItem } from "@prisma/client";

export function createDefaultInvoiceCode(customerName: string) {
  return customerName.slice(0, 2).toUpperCase();
}

export function formatCurrency(amount: number, currency: "USD" | "EUR") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function paginateInvoiceLineItems(
  items: InvoiceItem[],
  pageSize: number
) {
  return items.reduce((acc: InvoiceItem[][], _, i) => {
    if (i % pageSize === 0) {
      acc.push(items.slice(i, i + pageSize));
    }
    return acc;
  }, []);
}

export function calculateInvoiceSubtotal(invoiceItems: InvoiceItem[]) {
  return invoiceItems.reduce((acc, item) => {
    const itemTotal = item.quantity.toNumber() * item.rate.toNumber();
    return acc + itemTotal;
  }, 0);
}

export function calculateDiscountValue(
  invoiceSubtotal: number,
  discountType: "FIXED" | "PERCENTAGE",
  discountValue: number
) {
  if (discountType === "FIXED") {
    return discountValue;
  } else if (discountType === "PERCENTAGE") {
    return (invoiceSubtotal * discountValue) / 100;
  }
  return 0;
}

type Amount = number | string | { toString(): string };

export function getInvoiceBalance(invoice: {
  total: Amount;
  amountPaid: Amount;
  payments: { amount: Amount }[];
}) {
  const paid = invoice.payments.reduce(
    (acc, payment) => acc + Number(payment.amount),
    Number(invoice.amountPaid),
  );

  // Round to cents to avoid floating point leftovers like 0.0000001
  return Math.round((Number(invoice.total) - paid) * 100) / 100;
}
