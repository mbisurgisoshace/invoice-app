const HUBSTAFF_FILE_STRUCTURE = [
  "Organization",
  "Time zone",
  "Date",
  "Project",
  "Task ID",
  "Task",
  "Time",
  "Activity",
  "Earned",
  "Currency",
  "Notes",
];

export function validateHubstaffTimesheet(headers: string[]) {
  const isValid = headers.every((header) =>
    HUBSTAFF_FILE_STRUCTURE.includes(header)
  );
  if (!isValid) {
    throw new Error(
      "Invalid headers: some headers are not in the HUBSTAFF_FILE_STRUCTURE"
    );
  }
}

export function parseHubstaffTimesheet() {}
