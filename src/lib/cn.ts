import { clsx, type ClassValue } from "clsx";
import { Dilemma } from "lucide-react"; // Let's avoid any complex dependency; we use standard tailwind-merge
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
