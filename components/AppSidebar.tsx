"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText } from "lucide-react";

import { cn } from "@/lib/utils";
import Logo from "@/public/logo.png";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
];

interface AppSidebarProps {
  user: string;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Image src={Logo} alt="Logo" className="size-8" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-foreground">
          Invoicely
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-1" role="list">
          {navigation.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {user
              .split(" ")
              .map((name) => name[0])
              .join("")}
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium text-foreground">
              {user}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
