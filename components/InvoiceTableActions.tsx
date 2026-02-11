import {
  MailIcon,
  PencilIcon,
  Trash2Icon,
  DownloadIcon,
  CheckCircle2Icon,
  MoreHorizontalIcon,
  CalendarIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { toast } from "sonner";
import { deleteInvoice, markInvoiceAsPaid } from "@/app/actions/actions";

interface InvoiceTableActionsProps {
  status: string;
  invoiceId: string;
  invoiceOwner: boolean;
}

export default function InvoiceTableActions({
  status,
  invoiceId,
  invoiceOwner,
}: InvoiceTableActionsProps) {
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [markPaidDialogOpen, setMarkPaidDialogOpen] = useState(false);

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
      },
    );
  };

  const onDeleteInvoice = async () => {
    await deleteInvoice(invoiceId);
    setDeleteDialogOpen(false);
  };

  const onMarkAsPaid = async () => {
    await markInvoiceAsPaid(invoiceId, paymentDate.toISOString());
    setPaymentDate(new Date());
    setMarkPaidDialogOpen(false);
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
          {invoiceOwner && (
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/invoices/${invoiceId}`}>
                <PencilIcon className="mr-2 h-4 w-4" />
                Edit Invoice
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href={`/api/invoice/${invoiceId}`} target="_blank">
              <DownloadIcon className="mr-2 h-4 w-4" />
              Download Invoice
            </Link>
          </DropdownMenuItem>
          {invoiceOwner && (
            <DropdownMenuItem onClick={handleSentReminder}>
              <MailIcon className="mr-2 h-4 w-4" />
              Reminder Email
            </DropdownMenuItem>
          )}
          {invoiceOwner && status !== "PAID" && (
            <DropdownMenuItem
              onSelect={() => {
                setPaymentDate(new Date());
                setMarkPaidDialogOpen(true);
              }}
            >
              <CheckCircle2Icon className="mr-2 h-4 w-4" />
              Mark as Paid
            </DropdownMenuItem>
          )}
          {invoiceOwner && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={() => {
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2Icon className="mr-2 h-4 w-4" />
                Delete Invoice
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={markPaidDialogOpen}
        onOpenChange={setMarkPaidDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to mark this invoice as paid?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will mark your invoice as paid. Please select the payment
              date.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "long",
                }).format(paymentDate)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                //@ts-ignore
                mode="single"
                selected={paymentDate}
                //@ts-ignore
                onSelect={(date) => date && setPaymentDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onMarkAsPaid}>
              Mark as Paid
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={onDeleteInvoice}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
