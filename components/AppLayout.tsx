import React from "react";
import { AppSidebar } from "./AppSidebar";

export function DashboardLayout({
  children,
  fixedHeight = false,
}: {
  children: React.ReactNode;
  fixedHeight?: boolean;
}) {
  return (
    <div className="flex h-screen">
      <AppSidebar />
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
