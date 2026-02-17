"use client";

import { PencilIcon, ArchiveIcon, MoreHorizontalIcon } from "lucide-react";
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
import { archiveCustomer } from "@/app/actions/actions";

interface CustomerTableActionsProps {
  customerId: string;
}

export function CustomerTableActions({
  customerId,
}: CustomerTableActionsProps) {
  const [dialog, setDialog] = useState<string>("");

  const onArchiveCustomer = async () => {
    await archiveCustomer(customerId);
  };

  const renderDialog = () => {
    if (dialog === "deleteDialog")
      return (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to archive this customer?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will set your customer as archived and you want be able to
              see it on the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onArchiveCustomer}
              className={buttonVariants({ variant: "destructive" })}
            >
              Archive
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
                <ArchiveIcon className="size-4 mr-2" />
                Archive Customer
              </AlertDialogTrigger>
            </DropdownMenuItem>
          </DropdownMenuContent>
          {renderDialog()}
        </DropdownMenu>
      </AlertDialog>
    </>
  );
}
