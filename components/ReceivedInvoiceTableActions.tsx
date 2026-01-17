"use client";

import Link from "next/link";
import { DownloadCloudIcon, MoreHorizontalIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { AlertDialog } from "@/components/ui/alert-dialog";

interface InvoiceTableActionsProps {
  invoiceId: string;
}

export function ReceivedInvoiceTableActions({
  invoiceId,
}: InvoiceTableActionsProps) {
  return (
    <>
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size={"icon"} variant={"ghost"}>
              <MoreHorizontalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/api/invoice/${invoiceId}`} target="_blank">
                <DownloadCloudIcon className="size-4 mr-2" />
                Download Invoice
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </AlertDialog>
    </>
  );
}
