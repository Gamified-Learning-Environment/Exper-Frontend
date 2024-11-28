import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add your tailwind plugins to the config
// Export as a separate object if needed
export const tailwindConfig = {
  plugins: [
    require('tailwind-scrollbar-hide')
  ]
}
