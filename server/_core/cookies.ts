import type { CookieOptions, Request } from "express";

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "httpOnly" | "path" | "sameSite" | "secure"> {
  // With trust proxy enabled, req.secure / req.protocol correctly reflects
  // the original client request even behind a reverse proxy.
  const isSecure = req.secure || req.protocol === "https";

  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: isSecure,
  };
}
