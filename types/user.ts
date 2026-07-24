export type UserRole = "member" | "partner" | "admin";

export type PublicUser = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  verified: boolean;
  rank: string;
  referralCode: string;
  uplineId: string | null;
  teamIds: string[];
  address?: {
    streetAddress: string;
    streetAddressLine2: string;
    city: string;
    state: string;
    pincode: string;
  };
  addresses: Array<{
    id: string;
    fullName: string;
    phone: string;
    streetAddress: string;
    streetAddressLine2: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
    createdAt: string;
  }>;
  partnerProfile?: Record<string, unknown>;
  paymentMethods: Array<{
    id: string;
    type: string;
    details: string;
    expiry: string | null;
    isDefault: boolean;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
};
