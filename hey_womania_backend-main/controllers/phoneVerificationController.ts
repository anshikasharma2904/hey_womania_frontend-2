import { Request, Response } from "express";

const DEFAULT_COUNTRY_CODE = "+91";

function getTwilioVerifyConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!accountSid || !authToken || !verifyServiceSid) {
    throw new Error("Missing Twilio credentials in environment variables.");
  }

  return { accountSid, authToken, verifyServiceSid };
}

function normalizePhoneNumber(phone: string) {
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

function isValidE164(phone: string) {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}

function getTwilioAuthHeader(accountSid: string, authToken: string) {
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  return `Basic ${credentials}`;
}

export const startVerification = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    const normalizedPhone = normalizePhoneNumber(phone ?? "");

    if (!isValidE164(normalizedPhone)) {
      return res.status(400).json({
        ok: false,
        message: "Enter a valid phone number in international or 10-digit format."
      });
    }

    const { accountSid, authToken, verifyServiceSid } = getTwilioVerifyConfig();
    const response = await fetch(
      `https://verify.twilio.com/v2/Services/${verifyServiceSid}/Verifications`,
      {
        method: "POST",
        headers: {
          Authorization: getTwilioAuthHeader(accountSid, authToken),
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          To: normalizedPhone,
          Channel: "sms"
        })
      }
    );

    const payload = (await response.json()) as {
      message?: string;
      status?: string;
    };

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        message: payload.message ?? "Unable to send OTP right now."
      });
    }

    return res.json({
      ok: true,
      phone: normalizedPhone,
      status: payload.status ?? "pending",
      message: `OTP sent to ${normalizedPhone}`
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start phone verification.";
    return res.status(500).json({
      ok: false,
      message
    });
  }
};

export const checkVerification = async (req: Request, res: Response) => {
  try {
    const { phone, code } = req.body;
    const normalizedPhone = normalizePhoneNumber(phone ?? "");
    const otpCode = (code ?? "").trim();

    if (!isValidE164(normalizedPhone)) {
      return res.status(400).json({
        ok: false,
        message: "Enter a valid phone number before verifying OTP."
      });
    }

    if (!/^\d{4,10}$/.test(otpCode)) {
      return res.status(400).json({
        ok: false,
        message: "Enter a valid OTP code."
      });
    }

    const { accountSid, authToken, verifyServiceSid } = getTwilioVerifyConfig();
    const response = await fetch(
      `https://verify.twilio.com/v2/Services/${verifyServiceSid}/VerificationCheck`,
      {
        method: "POST",
        headers: {
          Authorization: getTwilioAuthHeader(accountSid, authToken),
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          To: normalizedPhone,
          Code: otpCode
        })
      }
    );

    const payload = (await response.json()) as {
      message?: string;
      status?: string;
      valid?: boolean;
    };

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        message: payload.message ?? "Unable to verify OTP right now."
      });
    }

    if (!payload.valid || payload.status !== "approved") {
      return res.status(400).json({
        ok: false,
        message: "Incorrect or expired OTP. Please try again."
      });
    }

    return res.json({
      ok: true,
      verified: true,
      message: "Phone number verified successfully."
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify phone number.";
    return res.status(500).json({
      ok: false,
      message
    });
  }
};
