import { NextResponse } from "next/server";

type KycVerificationPayload = {
  aadhaarNumber?: string;
  panNumber?: string;
  files?: {
    aadhaarFront?: string;
    aadhaarBack?: string;
    panFront?: string;
    panBack?: string;
  };
};

function requireText(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} is required.`);
  }

  return value.trim();
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as KycVerificationPayload;
    const aadhaarNumber = requireText(payload.aadhaarNumber, "Aadhaar number");
    const panNumber = requireText(payload.panNumber, "PAN number");

    const fileNames = payload.files ?? {};
    const hasAllFiles = Boolean(
      fileNames.aadhaarFront &&
        fileNames.aadhaarBack &&
        fileNames.panFront &&
        fileNames.panBack
    );

    if (!hasAllFiles) {
      return NextResponse.json(
        {
          ok: false,
          message: "Please upload Aadhaar front/back and PAN front/back documents before verification."
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: `KYC verified for ${aadhaarNumber.slice(-4)} / ${panNumber.slice(-4)}.`
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unable to verify KYC."
      },
      { status: 400 }
    );
  }
}
