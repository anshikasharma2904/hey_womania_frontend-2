const DEFAULT_COUNTRY_CODE = "+91";

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getTwilioVerifyConfig() {
  return {
    accountSid: requireEnv("TWILIO_ACCOUNT_SID"),
    authToken: requireEnv("TWILIO_AUTH_TOKEN"),
    verifyServiceSid: requireEnv("TWILIO_VERIFY_SERVICE_SID")
  };
}

export function normalizePhoneNumber(phone: string) {
  const trimmed = phone.trim();
  const cleaned = trimmed.replace(/[^\d+]/g, "");

  if (!cleaned) {
    return "";
  }

  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  if (/^\d{10}$/.test(cleaned)) {
    return `${DEFAULT_COUNTRY_CODE}${cleaned}`;
  }

  return cleaned;
}

export function isValidE164(phone: string) {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}

export function getTwilioAuthHeader(accountSid: string, authToken: string) {
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  return `Basic ${credentials}`;
}
