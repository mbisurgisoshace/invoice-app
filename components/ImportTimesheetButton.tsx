import Papa from "papaparse";
import { toast } from "sonner";
import Image from "next/image";
import { useRef, useState } from "react";
import { ImportIcon } from "lucide-react";

import ToptalLogo from "@/public/toptal-logo.svg";
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
import {
  validateHubstaffTimesheet,
  validateTopTrackerTimesheet,
} from "@/app/utils/import";

export type ImportedData = { description: string; quantity: number };

interface ImportTimesheetButtonProps {
  onImportData: (items: ImportedData[]) => void;
}

export function ImportTimesheetButton({
  onImportData,
}: ImportTimesheetButtonProps) {
  const [open, setOpen] = useState(false);
  const hubstaffInputRef = useRef<HTMLInputElement>(null);
  const topTrackerInputRef = useRef<HTMLInputElement>(null);

  const onImportItems = (items: Map<string, number>) => {
    const importedData: ImportedData[] = [];

    items.forEach((value, key) =>
      importedData.push({
        description: key,
        quantity: Math.floor(value * 100) / 100,
      })
    );
    onImportData(importedData);
    setOpen(false);
  };

  const onHandleHubstaffFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      Papa.parse(file, {
        header: true,
        complete(results, file) {
          try {
            validateHubstaffTimesheet(results.meta.fields || []);
            const items = new Map<string, number>();

            for (let index = 0; index < results.data.length; index++) {
              const item: any = results.data[index];
              if (!item.Time) continue;

              const [hours, mins] = item.Time.split(":");
              const convertedMinsIntoHours = parseFloat(mins) / 60;
              const totalTimeInHours =
                parseFloat(hours) + convertedMinsIntoHours;

              if (items.has(item.Date)) {
                const sumTime = items.get(item.Date) || 0;
                items.set(item.Date, sumTime + totalTimeInHours);
              } else {
                items.set(item.Date, totalTimeInHours);
              }
            }

            onImportItems(items);
          } catch (err: any) {
            toast.error(err.message);
          }
        },
      });
    }
  };

  const onHandleTopTrackerFile = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      Papa.parse(file, {
        header: true,
        complete(results, file) {
          try {
            validateTopTrackerTimesheet(results.meta.fields || []);
            const items = new Map<string, number>();

            for (let index = 0; index < results.data.length; index++) {
              const item: any = results.data[index];
              if (!item.start_time) continue;

              const date = item.start_time.substring(0, 10);
              const totalTimeInHours = parseFloat(item.duration_seconds) / 3600;

              if (items.has(date)) {
                const sumTime = items.get(date) || 0;
                items.set(date, sumTime + totalTimeInHours);
              } else {
                items.set(date, totalTimeInHours);
              }
            }

            onImportItems(items);
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
              <Button size={"icon"} variant={"link"} className="h-6">
                <ImportIcon size={10} />
              </Button>
            </TooltipTrigger>
          </DialogTrigger>
          <TooltipContent>Import from file</TooltipContent>
        </Tooltip>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import from File</DialogTitle>
            <DialogDescription className="flex flex-col gap-1 font-semibold">
              Import your timesheet records from your time tracking app.
              <span className="font-normal">
                Hubstaff: go to Reports {">"} Time & Activity {">"} Export{" "}
                {">"} To CSV {">"} Expanded Report
              </span>
              <span className="font-normal">
                TopTracker: go to Reports {">"} Export {">"} CSV
              </span>
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
              onChange={onHandleHubstaffFile}
            />
          </Button>

          <Button
            variant={"outline"}
            onClick={() => topTrackerInputRef.current?.click()}
          >
            <Image src={ToptalLogo} alt="TopTracker" className="h-5" />
            <input
              hidden
              type="file"
              id="toptracker"
              accept=".csv"
              ref={topTrackerInputRef}
              onChange={onHandleTopTrackerFile}
            />
          </Button>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
