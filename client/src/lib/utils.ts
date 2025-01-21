import { UserData } from "@/types";
import { jwtDecode } from "jwt-decode";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";
import { TOKEN_KEY, USER_DATA_KEY } from "@/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const setUserData = (data: UserData): void => {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
};

export const getUserData = (): UserData | null => {
  try {
    const data = localStorage.getItem(USER_DATA_KEY);
    if (!data) {
      return null;
    }
    return JSON.parse(data) as UserData;
  } catch (error) {
    console.error("Failed to parse user data from localStorage:", error);
    return null;
  }
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        clearUserData();
        return null;
      }
      return token;
    } catch (error) {
      console.log(error);
      clearUserData();
      return null;
    }
  }
  return null;
};

export const clearUserData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
};
