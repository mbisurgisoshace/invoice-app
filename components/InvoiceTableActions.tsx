import {
  PencilIcon,
  MailIcon,
  TrashIcon,
  CheckCircle,
  DownloadCloudIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

export function InvoiceTableActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={"icon"} variant={"ghost"}>
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={"/"}>
            <PencilIcon className="size-4 mr-2" />
            Edit Invoice
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={"/"}>
            <DownloadCloudIcon className="size-4 mr-2" />
            Download Invoice
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={"/"}>
            <MailIcon className="size-4 mr-2" />
            Reminder Email
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={"/"}>
            <CheckCircle className="size-4 mr-2" />
            Mark as Paid
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={"/"}>
            <TrashIcon className="size-4 mr-2" />
            Delete Invoice
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
