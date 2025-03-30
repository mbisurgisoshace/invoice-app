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
