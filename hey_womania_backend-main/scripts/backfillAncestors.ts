import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/User";

dotenv.config();

async function backfillAncestors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("Connected to MongoDB");

    // Fetch all users that have an uplineId but no ancestors
    const users = await User.find({ uplineId: { $exists: true, $ne: null } });
    console.log(`Found ${users.length} users with an upline.`);

    const userMap = new Map();
    const allUsers = await User.find({});
    allUsers.forEach(u => userMap.set(u.id, u));

    let updatedCount = 0;

    for (const user of users) {
      if (user.ancestors && user.ancestors.length > 0) continue; // Already has ancestors

      const ancestors: string[] = [];
      let currentUplineId = user.uplineId;

      // Build ancestors array tracing up the tree
      while (currentUplineId) {
        ancestors.unshift(currentUplineId);
        const uplineUser = userMap.get(currentUplineId);
        if (uplineUser && uplineUser.uplineId) {
          currentUplineId = uplineUser.uplineId;
        } else {
          break;
        }
      }

      if (ancestors.length > 0) {
        user.ancestors = ancestors;
        await user.save();
        updatedCount++;
      }
    }

    console.log(`Successfully backfilled ancestors for ${updatedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error("Error backfilling ancestors:", error);
    process.exit(1);
  }
}

backfillAncestors();
