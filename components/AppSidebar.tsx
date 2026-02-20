import Image from "next/image";

import Logo from "@/public/logo.png";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { signOut } from "@/app/utils/auth";
import SidebarNavigation from "./SidebarNavigation";
import { LogOutIcon } from "lucide-react";

interface AppSidebarProps {
  user: string;
}

export function AppSidebar({ user }: AppSidebarProps) {
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
      <SidebarNavigation />

      {/* Bottom section */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {user
              .split(" ")
              .map((name) => name[0])
              .join("")}
          </div>
          <div className="flex-1 truncate flex flex-row items-center w-full gap-3">
            <p className="truncate text-sm font-medium text-foreground">
              {user}
            </p>

            <form
              action={async () => {
                "use server";
                await signOut();
              }}
              className="flex items-center"
            >
              <button className="text-left">
                <LogOutIcon size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  );
}
