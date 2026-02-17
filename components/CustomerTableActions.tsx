"use client";

import { useState } from "react";
import { PencilIcon, Trash2Icon, MoreHorizontalIcon } from "lucide-react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogHeader,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { archiveCustomer } from "@/app/actions/actions";

interface CustomerTableActionsProps {
  customerId: string;
}

export default function CustomerTableActions({
  customerId,
}: CustomerTableActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const onArchiveCustomer = async () => {
    await archiveCustomer(customerId);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <MoreHorizontalIcon className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/customers/${customerId}`}>
              <PencilIcon className="mr-2 h-4 w-4" />
              Edit Customer
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => {
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2Icon className="mr-2 h-4 w-4" />
            Archive Customer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={onArchiveCustomer}
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
