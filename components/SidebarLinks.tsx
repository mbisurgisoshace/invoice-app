"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, Users2Icon, BookTextIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export const SIDEBAR_LINKS = [
  {
    id: 0,
    name: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
  },
  {
    id: 1,
    name: "Customers",
    href: "/dashboard/customers",
    icon: Users2Icon,
  },
  {
    id: 2,
    name: "Invoices",
    href: "/dashboard/invoices",
    icon: BookTextIcon,
  },
];

export function SidebarLinks() {
  const pathname = usePathname();

  return (
    <>
      {SIDEBAR_LINKS.map((link) => (
        <Link
          key={link.id}
          href={link.href}
          className={cn(
            pathname === link.href
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground",
            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary"
          )}
        >
          <link.icon className="size-4" />
          {link.name}
        </Link>
      ))}
    </>
  );
}
