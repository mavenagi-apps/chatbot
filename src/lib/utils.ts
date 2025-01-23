import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createId } from "@paralleldrive/cuid2"; 
import Cookies from "js-cookie"

const USER_ID_COOKIE = "maven_uid";
const COOKIE_MAX_AGE = 365; // day

export function getOrCreateUserId(): string {
  const existingId = Cookies.get(USER_ID_COOKIE);
  
  if (existingId) {
    return existingId;
  }

  const newId = createId();
  Cookies.set(USER_ID_COOKIE, newId, { 
    expires: COOKIE_MAX_AGE,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  });

  return newId;
} 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
