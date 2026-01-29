import "server-only";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "ju_admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 6;

export const isAdminSession = (cookieValue?: string | null) =>
  cookieValue === "1";

export const isAdminRequest = (request: NextRequest) =>
  isAdminSession(request.cookies.get(ADMIN_COOKIE)?.value);

export const isAdminFromCookies = async () => {
  const cookieStore = await cookies();
  return isAdminSession(cookieStore.get(ADMIN_COOKIE)?.value);
};
