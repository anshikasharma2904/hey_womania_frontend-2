"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FaAsterisk } from "react-icons/fa";

type PhoneVerificationFieldProps = {
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  showRequiredIcon?: boolean;
  initialPhone?: string;
  readOnlyPhone?: boolean;
  onPhoneChange?: (phone: string) => void;
  onVerifiedChange?: (verified: boolean) => void;
};

const OTP_LENGTH = 6;

export function PhoneVerificationField({
  id = "phone",
  name = "phone",
  label = "Phone Number",
  placeholder = "+91 98765 43210",
  showRequiredIcon = true,
  initialPhone = "",
  readOnlyPhone = false,
  onPhoneChange,
  onVerifiedChange
}: PhoneVerificationFieldProps) {
  const [phone, setPhone] = useState(initialPhone);
  const [otp, setOtp] = useState(Array.from({ length: OTP_LENGTH }, () => ""));
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isCheckingOtp, setIsCheckingOtp] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [lastSubmittedOtp, setLastSubmittedOtp] = useState("");
  const [status, setStatus] = useState<{
    tone: "idle" | "success" | "error";
    text: string;
  }>({
    tone: "idle",
    text: ""
  });
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const focusTimeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(false);
  const supportsWebOtp = useMemo(
    () => typeof window !== "undefined" && "OTPCredential" in window,
    []
  );

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;

      if (focusTimeoutRef.current !== null) {
        window.clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (resendSeconds <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setResendSeconds((current) => current - 1);
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [resendSeconds]);

  useEffect(() => {
    if (!isOtpSent || isVerified) {
      return;
    }

    if (
      typeof window === "undefined" ||
      !("OTPCredential" in window) ||
      !("credentials" in navigator)
    ) {
      return;
    }

    let abortController: AbortController | null = null;

    const readOtp = async () => {
      try {
        abortController = new AbortController();
        const content = (await navigator.credentials.get({
          otp: { transport: ["sms"] },
          signal: abortController.signal
        } as CredentialRequestOptions & { otp: { transport: string[] } })) as {
          code?: string;
        } | null;

        if (!content?.code) {
          return;
        }

        const nextOtp = content.code
          .slice(0, OTP_LENGTH)
          .split("")
          .concat(Array.from({ length: OTP_LENGTH }, () => ""))
          .slice(0, OTP_LENGTH);

        if (isMountedRef.current) {
          setOtp(nextOtp);
        }
      } catch {
        // Ignore WebOTP read failures and keep manual entry available.
      }
    };

    readOtp();

    return () => {
      abortController?.abort();
    };
  }, [isOtpSent, isVerified]);

  const otpValue = otp.join("");

  const resetVerificationState = () => {
    setIsOtpSent(false);
    setIsVerified(false);
    onVerifiedChange?.(false);
    setOtp(Array.from({ length: OTP_LENGTH }, () => ""));
    setResendSeconds(0);
    setLastSubmittedOtp("");
    setStatus({
      tone: "idle",
      text: ""
    });
  };

  const handleSendOtp = async () => {
    if (phone.trim().length < 10) {
      setStatus({
        tone: "error",
        text: "Enter a valid phone number before requesting OTP."
      });
      return;
    }

    try {
      setIsSendingOtp(true);
      setStatus({
        tone: "idle",
        text: ""
      });

      const response = await fetch("/api/phone-verification/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ phone })
      });

      const payload = (await response.json()) as {
        ok: boolean;
        message?: string;
      };

      if (!response.ok || !payload.ok) {
        if (!isMountedRef.current) {
          return;
        }
        setStatus({
          tone: "error",
          text: payload.message ?? "Unable to send OTP right now."
        });
        return;
      }

      if (!isMountedRef.current) {
        return;
      }

      setIsOtpSent(true);
      setIsVerified(false);
      onVerifiedChange?.(false);
      setOtp(Array.from({ length: OTP_LENGTH }, () => ""));
      setLastSubmittedOtp("");
      setResendSeconds(30);
      setStatus({
        tone: "success",
        text:
          payload.message ??
          "We sent a 6-digit code to your phone number. Enter it below to verify your account."
      });

      focusTimeoutRef.current = window.setTimeout(() => {
        if (isMountedRef.current) {
          otpRefs.current[0]?.focus();
        }
      }, 80);
    } catch {
      if (!isMountedRef.current) {
        return;
      }
      setStatus({
        tone: "error",
        text: "Unable to send OTP right now. Please try again."
      });
    } finally {
      if (!isMountedRef.current) {
        return;
      }
      setIsSendingOtp(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, "");

    if (!cleanValue) {
      const nextOtp = [...otp];
      nextOtp[index] = "";
      setOtp(nextOtp);
      return;
    }

    const nextOtp = [...otp];
    const chars = cleanValue.slice(0, OTP_LENGTH).split("");

    chars.forEach((char, charIndex) => {
      const targetIndex = index + charIndex;
      if (targetIndex < OTP_LENGTH) {
        nextOtp[targetIndex] = char;
      }
    });

    setOtp(nextOtp);

    const nextFocusIndex = Math.min(index + chars.length, OTP_LENGTH - 1);
    otpRefs.current[nextFocusIndex]?.focus();
  };

  const handleOtpKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (submittedOtp = otpValue) => {
    if (submittedOtp.length !== OTP_LENGTH) {
      setStatus({
        tone: "error",
        text: "Enter the full 6-digit OTP to verify your phone number."
      });
      return;
    }

    try {
      setIsCheckingOtp(true);

      const response = await fetch("/api/phone-verification/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phone,
          code: submittedOtp
        })
      });

      const payload = (await response.json()) as {
        ok: boolean;
        message?: string;
      };

      if (!response.ok || !payload.ok) {
        if (!isMountedRef.current) {
          return;
        }
        setIsVerified(false);
        onVerifiedChange?.(false);
        setStatus({
          tone: "error",
          text: payload.message ?? "Incorrect OTP. Please try again."
        });
        return;
      }

      if (!isMountedRef.current) {
        return;
      }

      setIsVerified(true);
      onVerifiedChange?.(true);
      setStatus({
        tone: "success",
        text: payload.message ?? "Phone number verified successfully."
      });
    } catch {
      if (!isMountedRef.current) {
        return;
      }
      setIsVerified(false);
      onVerifiedChange?.(false);
      setStatus({
        tone: "error",
        text: "Unable to verify OTP right now. Please try again."
      });
    } finally {
      if (!isMountedRef.current) {
        return;
      }
      setIsCheckingOtp(false);
    }
  };

  useEffect(() => {
    if (!isOtpSent || isVerified || isCheckingOtp) {
      return;
    }

    if (otpValue.length !== OTP_LENGTH || otpValue === lastSubmittedOtp) {
      return;
    }

    setLastSubmittedOtp(otpValue);
    void handleVerify(otpValue);
  }, [
    handleVerify,
    isCheckingOtp,
    isOtpSent,
    isVerified,
    lastSubmittedOtp,
    otpValue
  ]);

  return (
    <div className="block">
      <span className="mb-2 inline-flex items-center gap-1 text-xs uppercase tracking-[0.16em] text-[#48473d]">
        {label}
        {showRequiredIcon ? <FaAsterisk className="text-[0.58rem] text-[#9c4049]" /> : null}
      </span>

      <div className="relative">
        <input
          id={id}
          name={name}
          type="tel"
          required
          value={phone}
          readOnly={readOnlyPhone}
          onChange={(event) => {
            if (readOnlyPhone) return;
            setPhone(event.target.value);
            onPhoneChange?.(event.target.value);
            resetVerificationState();
          }}
          placeholder={placeholder}
          className={`w-full border-0 bg-transparent py-3 pr-[8.6rem] text-sm text-[#1c1c19] outline-none transition-colors placeholder:text-[#d6cfc7] sm:pr-[9.4rem] ${readOnlyPhone ? '' : 'border-b border-[#e8e2d9] focus:border-[#5f5d3e]'}`}
        />

        <button
          type="button"
          onClick={isOtpSent ? resetVerificationState : handleSendOtp}
          disabled={isSendingOtp}
          className="absolute right-0 top-1/2 inline-flex -translate-y-1/2 items-center gap-1.5 rounded-full border border-[#d9c9bb] bg-white px-3 py-1.5 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-[#9c4049] transition-all duration-200 hover:border-[#9c4049] hover:bg-[#fff7f3] sm:px-4 sm:text-[0.68rem]"
        >
          <span className="material-symbols-outlined text-[0.95rem] sm:text-base">verified_user</span>
          {isSendingOtp ? "Sending..." : isOtpSent ? "Reset" : "Verify"}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {isVerified ? (
          <span className="inline-flex items-center gap-1 text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-[#3f7d47]">
            <span className="material-symbols-outlined text-base">task_alt</span>
            Verified
          </span>
        ) : null}
      </div>

      {isOtpSent && !isVerified ? (
        <div className="mt-4 rounded-[1rem] border border-[#eadfd5] bg-[#fcf8f3] p-4">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#9c4049]">
              Enter OTP
            </p>
            <span className="text-[0.7rem] text-[#8b837b]">
              {supportsWebOtp ? "Autofill supported" : "Manual entry"}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-6 gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  otpRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={digit}
                onChange={(event) => handleOtpChange(index, event.target.value)}
                onKeyDown={(event) => handleOtpKeyDown(index, event)}
                className="h-12 min-w-0 rounded-[0.9rem] border border-[#ded4ca] bg-white text-center text-base font-semibold text-[#1c1c19] outline-none transition-colors focus:border-[#5f5d3e]"
              />
            ))}
          </div>

          <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#5f5d3e]">
              {isCheckingOtp
                ? "Verifying OTP..."
                : "OTP auto-verifies after the 6th digit."}
            </span>
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={resendSeconds > 0 || isSendingOtp}
              className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#9c4049] disabled:cursor-not-allowed disabled:text-[#b9afa5]"
            >
              {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : "Resend OTP"}
            </button>
          </div>
        </div>
      ) : null}

      {status.text ? (
        <p
          className={`mt-3 text-sm leading-6 ${
            status.tone === "error" ? "text-[#b42318]" : "text-[#5e5a54]"
          }`}
        >
          {status.text}
        </p>
      ) : null}
    </div>
  );
}
