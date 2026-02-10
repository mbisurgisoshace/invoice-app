"use client";

import {
  PencilIcon,
  MailIcon,
  TrashIcon,
  CheckCircle,
  DownloadCloudIcon,
  MoreHorizontalIcon,
  CalendarIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
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
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { deleteInvoice, markInvoiceAsPaid } from "@/app/actions/actions";

interface InvoiceTableActionsProps {
  status: string;
  invoiceId: string;
}

export function InvoiceTableActions({
  status,
  invoiceId,
}: InvoiceTableActionsProps) {
  const [dialog, setDialog] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleSentReminder = () => {
    toast.promise(
      fetch(`/api/email/${invoiceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
      {
        loading: "Sending reminder email...",
        success: "Reminder email sent succesfully!",
        error: "Failed to send reminder email",
      }
    );
  };

  const onDeleteInvoice = async () => {
    await deleteInvoice(invoiceId);
  };

  const onMarkAsPaid = async () => {
    await markInvoiceAsPaid(invoiceId, selectedDate.toISOString());
    setSelectedDate(new Date());
  };

  const renderDialog = () => {
    if (dialog === "deleteDialog")
      return (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this invoice?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              invoice.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteInvoice}
              className={buttonVariants({ variant: "destructive" })}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      );

    if (dialog === "paidDialog")
      return (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to mark this invoice as paid?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will mark your invoice as paid. Please select the payment
              date.
            </AlertDialogDescription>
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-[280px] text-left justify-start my-2"
                  >
                    <CalendarIcon />
                    {selectedDate ? (
                      <p>
                        {new Intl.DateTimeFormat("en-US", {
                          dateStyle: "long",
                        }).format(selectedDate)}
                      </p>
                    ) : (
                      <span>Pick a Date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    //@ts-ignore
                    mode="single"
                    //@ts-ignore
                    selected={selectedDate}
                    //@ts-ignore
                    onSelect={setSelectedDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onMarkAsPaid} disabled={!selectedDate}>
              Mark as Paid
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
              <Link href={`/dashboard/invoices/${invoiceId}`}>
                <PencilIcon className="size-4 mr-2" />
                Edit Invoice
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/api/invoice/${invoiceId}`} target="_blank">
                <DownloadCloudIcon className="size-4 mr-2" />
                Download Invoice
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSentReminder}>
              <MailIcon className="size-4 mr-2" />
              Reminder Email
            </DropdownMenuItem>
            {status !== "PAID" && (
              <DropdownMenuItem
                asChild
                className="w-full"
                onSelect={() => setDialog("paidDialog")}
              >
                <AlertDialogTrigger>
                  <CheckCircle className="size-4 mr-2" />
                  Mark as Paid
                </AlertDialogTrigger>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              asChild
              className="w-full"
              onSelect={() => setDialog("deleteDialog")}
            >
              <AlertDialogTrigger>
                <TrashIcon className="size-4 mr-2" />
                Delete Invoice
              </AlertDialogTrigger>
            </DropdownMenuItem>
          </DropdownMenuContent>
          {renderDialog()}
        </DropdownMenu>
      </AlertDialog>
    </>
  );
}
