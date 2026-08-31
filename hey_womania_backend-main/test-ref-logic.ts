import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/heywomania");
  
  const sponsorRef = "SUNI90DBF9";
  const sponsor = await mongoose.connection.collection("users").findOne({ 
    $or: [{ referralCode: sponsorRef }, { partnerReferralCode: sponsorRef }] 
  });
  
  if (sponsor) {
    console.log("Found sponsor:", sponsor.email);
    console.log("sponsor.referralCode:", sponsor.referralCode);
    console.log("sponsor.partnerReferralCode:", sponsor.partnerReferralCode);
  } else {
    console.log("NOT FOUND!");
  }
  process.exit(0);
}
run();
