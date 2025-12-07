import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function getPlayerName(): string {
  if (typeof window !== "undefined") {
    let name = localStorage.getItem("playerName");
    if (!name) {
      name = `Player${Math.floor(Math.random() * 9000) + 1000}`;
      localStorage.setItem("playerName", name);
    }
    return name;
  }
  return "Anonymous";
}