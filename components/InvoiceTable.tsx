"use client";

import { ChevronRightIcon, SearchIcon } from "lucide-react";
import { Fragment, useEffect, useState } from "react";

import { Badge } from "./ui/badge";
import InvoiceTableActions, { InvoicePayment } from "./InvoiceTableActions";

type Invoice = {
  id: string;
  date: string;
  amount: string;
  invoiceName: string;
  invoiceNumber: string;
  status: "PAID" | "PENDING";
  balance: number;
  pendingAmount: string;
  hasPayments: boolean;
  advance: string | null;
  payments: InvoicePayment[];
};

type PaymentLine = {
  key: string;
  label: string;
  amount: string;
  date: string;
};

function getPaymentLines(invoice: Invoice): PaymentLine[] {
  const lines: PaymentLine[] = invoice.payments.map((payment) => ({
    key: payment.id,
    label: payment.note || "Payment",
    amount: payment.amount,
    date: payment.date,
  }));

  if (invoice.advance) {
    lines.unshift({
      key: "advance",
      label: "Advance",
      amount: invoice.advance,
      date: invoice.date,
    });
  }

  return lines;
}

// Each cell wraps its content in a grid that animates between 0fr and 1fr,
// which lets table rows expand and collapse smoothly.
function SubrowCell({
  open,
  className = "",
  children,
}: {
  open: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <td className="p-0 align-middle">
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className={`px-4 py-2 ${className}`}>{children}</div>
        </div>
      </div>
    </td>
  );
}

interface InvoicesTableProps {
  sentInvoices: Invoice[];
  receivedInvoices: Invoice[];
}

export function InvoicesTable({
  sentInvoices,
  receivedInvoices,
}: InvoicesTableProps) {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<Invoice[]>(sentInvoices);
  const [activeTab, setActiveTab] = useState<"sent" | "received">("sent");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredInvoices = data.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceName.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    setData(activeTab === "sent" ? sentInvoices : receivedInvoices);
  }, [sentInvoices, receivedInvoices]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      {/* Tabs and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setActiveTab("sent");
              setExpanded(new Set());
              setData(sentInvoices);
            }}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "sent"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sent
          </button>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setActiveTab("received");
              setExpanded(new Set());
              setData(receivedInvoices);
            }}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "received"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Received
          </button>
        </div>

        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-card pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 sm:w-64"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-border/60 bg-card">
        <div className="relative min-h-0 flex-1">
          {/* Scrollable area with sticky header */}
          <div className="absolute inset-0 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-card [&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-transparent">
                  <th className="h-12 w-[140px] px-4 text-left align-middle font-medium text-muted-foreground">
                    Invoice ID
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Customer
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    <div className="flex items-center gap-1">
                      Amount
                      {/* <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/60" /> */}
                    </div>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Pending
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    <div className="flex items-center gap-1">
                      Date
                      {/* <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/60" /> */}
                    </div>
                  </th>
                  <th className="h-12 w-[50px] px-4 text-left align-middle font-medium text-muted-foreground">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredInvoices.map((invoice) => {
                  const lines = getPaymentLines(invoice);
                  const expandable = lines.length > 0;
                  const open = expandable && expanded.has(invoice.id);

                  return (
                    <Fragment key={invoice.id}>
                      <tr
                        onClick={() => expandable && toggleExpanded(invoice.id)}
                        className={`group transition-colors hover:bg-muted/50 ${
                          expandable ? "cursor-pointer" : ""
                        } ${open ? "bg-muted/30" : "border-b"}`}
                      >
                        <td className="p-4 align-middle font-medium text-foreground">
                          <div className="flex items-center gap-1.5">
                            {expandable ? (
                              <button
                                type="button"
                                aria-expanded={open}
                                aria-label={
                                  open ? "Hide payments" : "Show payments"
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpanded(invoice.id);
                                }}
                                className="-ml-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              >
                                <ChevronRightIcon
                                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                                    open ? "rotate-90" : ""
                                  }`}
                                />
                              </button>
                            ) : (
                              <span className="-ml-1.5 w-5 shrink-0" />
                            )}
                            # {invoice.invoiceNumber}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                              {invoice.invoiceName
                                .split(" ")
                                .map((w) => w[0])
                                .join("")
                                .slice(0, 2)}
                            </div>
                            <span className="text-foreground">
                              {invoice.invoiceName}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 align-middle font-medium tabular-nums text-foreground">
                          {invoice.amount}
                        </td>
                        <td className="p-4 align-middle tabular-nums text-muted-foreground">
                          {invoice.status === "PAID"
                            ? "—"
                            : invoice.pendingAmount}
                        </td>
                        <td className="p-4 align-middle">
                          <Badge
                            className={`border-0 px-2.5 py-0.5 text-[11px] font-medium ${
                              invoice.status === "PAID"
                                ? "bg-success/10 text-success hover:bg-success/15"
                                : "bg-warning/10 text-warning hover:bg-warning/15"
                            }`}
                          >
                            {invoice.status === "PAID"
                              ? "Paid"
                              : invoice.hasPayments
                                ? "Partially paid"
                                : "Pending"}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle text-muted-foreground">
                          {invoice.date}
                        </td>
                        <td
                          className="p-4 align-middle"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <InvoiceTableActions
                            invoiceId={invoice.id}
                            status={invoice.status}
                            balance={invoice.balance}
                            payments={invoice.payments}
                            invoiceOwner={activeTab === "sent"}
                          />
                        </td>
                      </tr>
                      {lines.map((line, index) => (
                        <tr
                          key={line.key}
                          aria-hidden={!open}
                          className={`text-[13px] transition-colors ${
                            open ? "bg-muted/30" : ""
                          } ${open && index === lines.length - 1 ? "border-b" : ""}`}
                        >
                          <SubrowCell open={open}>
                            <div className="ml-px flex h-4 items-center">
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  line.key === "advance"
                                    ? "bg-muted-foreground/40"
                                    : "bg-success/70"
                                }`}
                              />
                            </div>
                          </SubrowCell>
                          <SubrowCell
                            open={open}
                            className="truncate pl-[3.375rem] text-muted-foreground"
                          >
                            {line.label}
                          </SubrowCell>
                          <SubrowCell
                            open={open}
                            className="tabular-nums text-foreground/80"
                          >
                            {line.amount}
                          </SubrowCell>
                          <SubrowCell open={open} />
                          <SubrowCell open={open} />
                          <SubrowCell
                            open={open}
                            className="text-muted-foreground"
                          >
                            {line.date}
                          </SubrowCell>
                          <SubrowCell open={open} />
                        </tr>
                      ))}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination - always visible at bottom */}
        <div className="shrink-0 border-t border-border/60 px-4 py-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Showing {filteredInvoices.length} of {data.length} invoices
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
