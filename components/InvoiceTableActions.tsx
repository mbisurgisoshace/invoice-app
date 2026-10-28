import {
  MailIcon,
  PencilIcon,
  Trash2Icon,
  DownloadIcon,
  CheckCircle2Icon,
  MoreHorizontalIcon,
  CalendarIcon,
  WalletIcon,
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
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogContent,
  DialogDescription,
} from "./ui/dialog";
import { Input } from "./ui/input";
import {
  deleteInvoice,
  markInvoiceAsPaid,
  addInvoicePayment,
  deleteInvoicePayment,
} from "@/app/actions/actions";

export type InvoicePayment = {
  id: string;
  date: string;
  amount: string;
  note: string | null;
};

interface InvoiceTableActionsProps {
  status: string;
  balance: number;
  invoiceId: string;
  invoiceOwner: boolean;
  payments: InvoicePayment[];
}

export default function InvoiceTableActions({
  status,
  balance,
  invoiceId,
  invoiceOwner,
  payments,
}: InvoiceTableActionsProps) {
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentNote, setPaymentNote] = useState<string>("");
  const [savingPayment, setSavingPayment] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [markPaidDialogOpen, setMarkPaidDialogOpen] = useState(false);
  const [paymentsDialogOpen, setPaymentsDialogOpen] = useState(false);

  const paymentAmountValue = parseFloat(paymentAmount || "0");
  const isPaymentAmountValid =
    paymentAmountValue > 0 && paymentAmountValue <= balance;

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

  const onAddPayment = async () => {
    setSavingPayment(true);
    try {
      await addInvoicePayment(
        invoiceId,
        paymentAmountValue,
        paymentDate.toISOString(),
        paymentNote,
      );
      setPaymentsDialogOpen(false);
      toast.success("Payment recorded");
    } catch {
      toast.error("Failed to record payment");
    } finally {
      setSavingPayment(false);
    }
  };

  const onDeletePayment = async (paymentId: string) => {
    try {
      await deleteInvoicePayment(paymentId);
      toast.success("Payment deleted");
    } catch {
      toast.error("Failed to delete payment");
    }
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
          {invoiceOwner && (
            <DropdownMenuItem
              onSelect={() => {
                setPaymentDate(new Date());
                setPaymentAmount(balance > 0 ? balance.toString() : "");
                setPaymentNote("");
                setPaymentsDialogOpen(true);
              }}
            >
              <WalletIcon className="mr-2 h-4 w-4" />
              {status !== "PAID" ? "Record Payment" : "Payments"}
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

      <Dialog open={paymentsDialogOpen} onOpenChange={setPaymentsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payments</DialogTitle>
            <DialogDescription>
              {status !== "PAID"
                ? "Record a payment received for this invoice. It will be marked as paid once the pending amount reaches zero."
                : "This invoice is fully paid."}
            </DialogDescription>
          </DialogHeader>

          {payments.length > 0 && (
            <ul className="divide-y rounded-md border text-sm">
              {payments.map((payment) => (
                <li
                  key={payment.id}
                  className="flex items-center justify-between gap-3 px-3 py-2"
                >
                  <div className="flex flex-col">
                    <span className="font-medium tabular-nums text-foreground">
                      {payment.amount}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {payment.date}
                      {payment.note ? ` · ${payment.note}` : ""}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onDeletePayment(payment.id)}
                  >
                    <Trash2Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="sr-only">Delete payment</span>
                  </Button>
                </li>
              ))}
            </ul>
          )}

          {status !== "PAID" && (
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <Input
                  type="number"
                  min={0}
                  max={balance}
                  step="0.01"
                  placeholder="Amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
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
              </div>
              <Input
                placeholder="Note (optional)"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
              />
              {paymentAmountValue > balance && (
                <p className="text-xs text-destructive">
                  Amount is greater than the pending amount ({balance}).
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaymentsDialogOpen(false)}
            >
              Close
            </Button>
            {status !== "PAID" && (
              <Button
                onClick={onAddPayment}
                disabled={!isPaymentAmountValid || savingPayment}
              >
                Record Payment
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
