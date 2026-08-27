import { cookies } from "next/headers";

export type PartnerDashboardResponse = {
  user?: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    rank?: string;
    teamIds?: string[];
    referralCode?: string;
    partnerReferralCode?: string;
    partnerProfile?: {
      womaniyaaPoints?: unknown[];
    };
  };
  dashboard?: {
    totalOrders?: number;
    totalReferrals?: number;
    walletBalance?: number;
    networkWalletBalance?: number;
    rank?: string;
    sellPriceTotal?: number;
    sellPointsTotal?: number;
    activeDirects?: number;
    currentMonthSelfSales?: number;
    womaniyaaPointsStreak?: number;
    superWomaniyaaPointsStreak?: number;
    activeWomaniyaaPoints?: number;
    activeSuperWomaniyaaPoints?: number;
    selfSellIncome?: number;
    fastTrackIncome?: number;
    scoreIncome?: number;
    dreamCarFundIncome?: number;
    dreamHouseFundIncome?: number;
    partnershipBonusIncome?: number;
    smartSellerPoolIncome?: number;
    annualClubIncome?: number;
    timelyRewardsIncome?: number;
    kycVerified?: boolean;
    nomineeDetails?: {
      nomineeName?: string;
      nomineeRelation?: string;
      nomineeAge?: string;
      nomineeDob?: string;
    };
  };
  businessPlan?: {
    formula?: string;
    minimumPayoutSellPoints?: number;
    minimumActiveDirects?: number;
    selfSellIncome?: string;
    fastTrackIncome?: string[];
    scoreIncome?: Record<string, string>;
    dreamFunds?: Record<string, string>;
    partnershipBonus?: string;
    smartSellerPool?: string;
    annualClubs?: Record<string, string>;
    timelyRewards?: string;
  };
};

export async function getPartnerDashboardData(): Promise<PartnerDashboardResponse | null> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("hey_womania_session");

    if (!session) {
      return null;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/partner/dashboard`,
      {
        headers: {
          Cookie: `hey_womania_session=${session.value}`
        },
        cache: "no-store"
      }
    );

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch {
    return null;
  }
}

export function formatCurrency(value: number) {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export async function getPartnerIncomeLedgers(): Promise<any[] | null> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("hey_womania_session");

    if (!session) {
      return null;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/partner/ledgers`,
      {
        headers: {
          Cookie: `hey_womania_session=${session.value}`
        },
        cache: "no-store"
      }
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.ledgers || null;
  } catch {
    return null;
  }
}

export async function getPartnerReferralsList(): Promise<any | null> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("hey_womania_session");

    if (!session) {
      return null;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/partner/referrals`,
      {
        headers: {
          Cookie: `hey_womania_session=${session.value}`
        },
        cache: "no-store"
      }
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data || null;
  } catch {
    return null;
  }
}

export async function getPartnerOrders(): Promise<any[] | null> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("hey_womania_session");

    if (!session) {
      return null;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/orders`,
      {
        headers: {
          Cookie: `hey_womania_session=${session.value}`
        },
        cache: "no-store"
      }
    );

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch {
    return null;
  }
}
