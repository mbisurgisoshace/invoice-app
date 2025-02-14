"use client";

import { PencilIcon, TrashIcon, MoreHorizontalIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "./ui/dropdown-menu";
import { Button, buttonVariants } from "./ui/button";
import {
  AlertDialog,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogHeader,
  AlertDialogCancel,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { deleteInvoice } from "@/app/actions/actions";

interface CustomerTableActionsProps {
  customerId: string;
}

export function CustomerTableActions({
  customerId,
}: CustomerTableActionsProps) {
  const [dialog, setDialog] = useState<string>("");

  const onDeleteCustomer = async () => {
    await deleteInvoice(customerId);
  };

  const renderDialog = () => {
    if (dialog === "deleteDialog")
      return (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this customer?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              customer and all invoices attached to it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteCustomer}
              className={buttonVariants({ variant: "destructive" })}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      );
  };

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
              <Link href={`/dashboard/customers/${customerId}`}>
                <PencilIcon className="size-4 mr-2" />
                Edit Customer
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="w-full"
              onSelect={() => setDialog("deleteDialog")}
            >
              <AlertDialogTrigger>
                <TrashIcon className="size-4 mr-2" />
                Delete Customer
              </AlertDialogTrigger>
            </DropdownMenuItem>
          </DropdownMenuContent>
          {renderDialog()}
        </DropdownMenu>
      </AlertDialog>
    </>
  );
}
