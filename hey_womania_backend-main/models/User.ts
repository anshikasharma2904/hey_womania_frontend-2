import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  id: String,
  fullName: String,
  phone: String,
  streetAddress: String,
  streetAddressLine2: String,
  city: String,
  state: String,
  pincode: String,
  isDefault: Boolean,
  createdAt: String,
});

const paymentMethodSchema = new mongoose.Schema({
  id: String,
  type: String,
  details: String,
  expiry: String,
  isDefault: Boolean,
  createdAt: String,
});

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  name: String,
  email: { type: String, required: true, unique: true },
  phone: String,
  passwordHash: String,
  role: { type: String, enum: ["member", "partner", "admin"], default: "member" },
  verified: { type: Boolean, default: false },
  rank: String,
  referralCode: String,
  uplineId: String,
  teamIds: [String],
  address: {
    streetAddress: String,
    streetAddressLine2: String,
    city: String,
    state: String,
    pincode: String,
  },
  addresses: [addressSchema],
  paymentMethods: [paymentMethodSchema],
  partnerProfile: mongoose.Schema.Types.Mixed,
  resetOtp: String,
  resetOtpExpiry: Date,
  isBlocked: { type: Boolean, default: false },
  createdAt: String,
  updatedAt: String,
}, { collection: "users" });

export const User = mongoose.model("User", userSchema);
