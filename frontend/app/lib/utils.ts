import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import { toast } from "sonner";
import type { APIErrorType } from "~/types/dataTypes";

export function isClient() {
  return typeof window !== "undefined";
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const setAxiosAuthToken = (token: string) => {
  if (typeof token !== "undefined" && token) {
    Object.assign(axios.defaults.headers.common, {
      Authorization: `Token ${token}`,
    });
    // axios.defaults.headers.common['Authorization'] = 'Token ' + token;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
};

export const isEmpty = (value: any) =>
  value === undefined ||
  value === null ||
  (typeof value === "object" && Object.keys(value).length === 0) ||
  (typeof value === "string" && value.trim().length === 0);

export const GetBaseUrl = (): string => {
  if (!isClient()) return "";
  if (window.location.origin.includes("localhost")) {
    return import.meta.env.VITE_API_URL;
  }
  return `https://botsupport.team/api/`;
};

export const GetWebSocketUrl = (): string => {
  if (window.location.origin.includes("localhost")) {
    return import.meta.env.VITE_API_URL;
  }
  return `wss://botsupport.team/`;
};

export const toastOnError = (error: APIErrorType) => {
  if (error?.extra?.fields) {
    if (error?.extra?.fields?.non_field_errors) {
      toast.error(error?.extra?.fields?.non_field_errors?.[0]);
    } else if (error?.extra?.fields?.password) {
      toast.error("password invalid");
    } else if (error?.extra?.fields?.email) {
      toast.error(JSON.stringify("invalid email"));
    } else if (error?.extra?.fields?.username) {
      toast.error("invalid username");
    }
    // known error
    // toast.error(JSON.stringify(error.response.data));
  } else if (error.message) {
    toast.error(JSON.stringify(error.message));
  } else {
    toast.error(JSON.stringify(error));
  }
};

export function isAxiosError(error: unknown): error is {
  response?: {
    data: unknown;
    status: number;
  };
} {
  return typeof error === "object" && error !== null && "response" in error;
}
