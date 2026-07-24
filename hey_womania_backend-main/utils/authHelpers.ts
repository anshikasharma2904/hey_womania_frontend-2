import crypto from "crypto";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getAuthSecret() {
  return process.env.AUTH_SECRET || "dev-only-change-this-auth-secret";
}

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await new Promise<string>((resolve, reject) => {
    crypto.pbkdf2(password, salt, 210000, 64, "sha512", (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey.toString("hex"));
    });
  });

  return `pbkdf2_sha512$210000$${salt}$${hash}`;
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [algorithm, iterationsValue, salt, storedHash] = passwordHash.split("$");

  if (algorithm !== "pbkdf2_sha512" || !iterationsValue || !salt || !storedHash) {
    return false;
  }

  const iterations = Number(iterationsValue);
  const hash = await new Promise<string>((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, 64, "sha512", (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey.toString("hex"));
    });
  });

  const currentHash = Buffer.from(hash, "hex");
  const expectedHash = Buffer.from(storedHash, "hex");

  if (currentHash.length !== expectedHash.length) {
    return false;
  }

  return crypto.timingSafeEqual(currentHash, expectedHash);
}

export function createSessionToken(user: { id: string; role: string }) {
  const payload = {
    id: user.id,
    role: user.role,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getAuthSecret())
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}
