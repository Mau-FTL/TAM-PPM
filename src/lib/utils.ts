
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to format date string (ISO or Date object) to 'YYYY-MM-DD' for date inputs
// Uses UTC date components to prevent timezone-related off-by-one errors during display.
export function formatDateForInput(dateStringOrDate: string | Date): string {
  if (!dateStringOrDate) return '';
  
  const date = new Date(dateStringOrDate);

  // Check if the date is valid after construction.
  // new Date("YYYY-MM-DD") is treated as UTC midnight by ECMAScript spec.
  // new Date(DateObject) or new Date(ISOString) are also handled.
  if (isNaN(date.getTime())) {
    // If parsing results in an invalid date, return empty string or handle error.
    // This could happen if dateStringOrDate is an unparseable string.
    return ''; 
  }

  // Use UTC methods to extract date parts. This ensures that the date,
  // whether originally a Date object, a full ISO string, or "YYYY-MM-DD" (parsed as UTC),
  // is formatted to "YYYY-MM-DD" based on its UTC value.
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // getUTCMonth() is 0-indexed
  const day = date.getUTCDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

