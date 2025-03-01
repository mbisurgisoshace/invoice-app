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
