export function createDefaultInvoiceCode(customerName: string) {
  return customerName.slice(0, 2).toUpperCase();
}

export function formatCurrency(amount: number, currency: "USD" | "EUR") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}
