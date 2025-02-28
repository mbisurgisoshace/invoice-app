import Papa from "papaparse";
import { toast } from "sonner";
import Image from "next/image";
import { useRef, useState } from "react";
import { ImportIcon } from "lucide-react";

import HubstaffLogo from "@/public/hubstaff-logo.svg";

import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from "./ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "./ui/tooltip";
import { Button } from "./ui/button";
import { validateHubstaffTimesheet } from "@/app/utils/import";

export type ImportedData = { description: string; quantity: number };

interface ImportTimesheetButtonProps {
  onImportData: (items: ImportedData[]) => void;
}

export function ImportTimesheetButton({
  onImportData,
}: ImportTimesheetButtonProps) {
  const [open, setOpen] = useState(false);
  const hubstaffInputRef = useRef<HTMLInputElement>(null);

  const onHandleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      Papa.parse(file, {
        header: true,
        complete(results, file) {
          try {
            validateHubstaffTimesheet(results.meta.fields || []);
            const importedData: ImportedData[] = [];
            const items = new Map<string, number>();

            for (let index = 0; index < results.data.length; index++) {
              const item: any = results.data[index];
              if (!item.Time) continue;

              const [hours, mins] = item.Time.split(":");
              const convertedMinsIntoHours = parseFloat(mins) / 60;
              const totalTimeInHours =
                parseFloat(hours) + convertedMinsIntoHours;

              if (items.has(item.Task)) {
                const sumTime = items.get(item.Task) || 0;
                items.set(item.Task, sumTime + totalTimeInHours);
              } else {
                items.set(item.Task, totalTimeInHours);
              }
            }

            items.forEach((value, key) =>
              importedData.push({
                description: key,
                quantity: Math.floor(value * 100) / 100,
              })
            );
            onImportData(importedData);
            setOpen(false);
          } catch (err: any) {
            toast.error(err.message);
          }
        },
      });
    }
  };

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={setOpen}>
        <Tooltip>
          <DialogTrigger asChild>
            <TooltipTrigger asChild>
              <Button size={"icon"} variant={"link"} onClick={(e) => {}}>
                <ImportIcon size={10} />
              </Button>
            </TooltipTrigger>
          </DialogTrigger>
          <TooltipContent>Import from file</TooltipContent>
        </Tooltip>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import from File</DialogTitle>
            <DialogDescription>
              Import your timesheet records from your time tracking app
            </DialogDescription>
          </DialogHeader>

          <Button
            variant={"outline"}
            onClick={() => hubstaffInputRef.current?.click()}
          >
            <Image src={HubstaffLogo} alt="Hubstaff" className="h-5" />
            <input
              hidden
              type="file"
              id="hubstaff"
              accept=".csv"
              ref={hubstaffInputRef}
              onChange={onHandleFile}
            />
          </Button>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
