import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "hey_womania_session";

function getAuthSecret() {
  return process.env.AUTH_SECRET || "dev-only-change-this-auth-secret";
}

export function verifySessionToken(token: string) {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) return null;

  const expectedSignature = crypto
    .createHmac("sha256", getAuthSecret())
    .update(encodedPayload)
    .digest("base64url");

  const currentSignature = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    currentSignature.length !== expectedSignatureBuffer.length ||
    !crypto.timingSafeEqual(currentSignature, expectedSignatureBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (!payload.id || Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies[SESSION_COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Invalid session" });
  }

  // @ts-ignore
  req.user = payload;
  next();
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies[SESSION_COOKIE_NAME];
  if (token) {
    const payload = verifySessionToken(token);
    if (payload) {
      // @ts-ignore
      req.user = payload;
    }
  }
  next();
};
