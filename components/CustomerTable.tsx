"use client";

import { useEffect, useState } from "react";
import CustomerTableActions from "./CustomerTableActions";

type Customer = {
  id: string;
  name: string;
  email: string;
  address: string | null;
  phoneNumber: string | null;
};

interface CustomerTableProps {
  customers: Customer[];
}

export function CustomerTable({ customers }: CustomerTableProps) {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<Customer[]>(customers);

  const filteredCustomers = data.filter(
    (customer) =>
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    setData(customers);
  }, [customers]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-border/60 bg-card">
        <div className="relative min-h-0 flex-1">
          {/* Scrollable area with sticky header */}
          <div className="absolute inset-0 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-card [&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-transparent">
                  <th className="px-4 text-left align-middle font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Email
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    <div className="flex items-center gap-1">
                      Address
                      {/* <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/60" /> */}
                    </div>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Phone Number
                  </th>
                  <th className="h-12 w-[50px] px-4 text-left align-middle font-medium text-muted-foreground">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="group cursor-pointer border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2.5">
                        {customer.name}
                      </div>
                    </td>

                    <td className="p-4 align-middle font-medium tabular-nums text-foreground">
                      {customer.email}
                    </td>
                    <td className="p-4 align-middle font-medium tabular-nums text-foreground">
                      {customer.address}
                    </td>
                    <td className="p-4 align-middle font-medium tabular-nums text-foreground">
                      {customer.phoneNumber}
                    </td>
                    <td className="p-4 align-middle">
                      <CustomerTableActions customerId={customer.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination - always visible at bottom */}
        <div className="shrink-0 border-t border-border/60 px-4 py-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Showing {filteredCustomers.length} of {data.length} customers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
