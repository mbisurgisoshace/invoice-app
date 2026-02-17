import React from "react";
import { AppSidebar } from "./AppSidebar";
import { requireUser } from "@/app/utils/hooks";

export async function DashboardLayout({
  children,
  fixedHeight = false,
}: {
  children: React.ReactNode;
  fixedHeight?: boolean;
}) {
  const session = await requireUser();

  return (
    <div className="flex h-screen">
      <AppSidebar
        user={`${(session.user as any).firstName} ${(session.user as any).lastName}`}
      />
      <main
        className={`flex flex-1 flex-col pl-60 ${
          fixedHeight ? "overflow-hidden" : "overflow-y-auto"
        }`}
      >
        <div
          className={`mx-auto flex w-full max-w-6xl flex-col px-8 py-8 ${
            fixedHeight ? "min-h-0 flex-1" : ""
          }`}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
