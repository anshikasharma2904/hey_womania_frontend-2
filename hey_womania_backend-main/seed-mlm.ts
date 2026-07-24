import mongoose from "mongoose";
import { User } from "./models/User";
import { Order } from "./models/Order";
import { SellPointLedger } from "./models/SellPointLedger";
import { IncomeLedger } from "./models/IncomeLedger";
import { PartnerDashboard } from "./models/PartnerDashboard";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/heywomania";

async function ensureDashboard(userId: string) {
  let dashboard = await PartnerDashboard.findOne({ userId });
  if (!dashboard) {
    dashboard = await PartnerDashboard.create({
      userId,
      totalOrders: 0,
      totalReferrals: 0,
      walletBalance: 0,
      rank: "Starter",
      sellPriceTotal: 0,
      sellPointsTotal: 0,
      activeDirects: 0,
      selfSellIncome: 0,
      fastTrackIncome: 0,
      scoreIncome: 0,
      dreamCarFundIncome: 0,
      dreamHouseFundIncome: 0,
      partnershipBonusIncome: 0,
      smartSellerPoolIncome: 0,
      annualClubIncome: 0,
      timelyRewardsIncome: 0,
      kycVerified: true,
      nomineeDetails: {
        nomineeName: "",
        nomineeRelation: "",
        nomineeAge: "",
        nomineeDob: ""
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  return dashboard;
}

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    // 1. Find or create Root user
    let root = await User.findOne({ referralCode: "ROOT123" });
    if (!root) {
      console.log("Root user not found, creating root user...");
      root = new User({
        id: crypto.randomUUID(),
        firstName: "Root",
        lastName: "Partner",
        name: "Root Partner",
        email: "root@womania.com",
        role: "partner",
        rank: "Starter",
        referralCode: "ROOT123",
        teamIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      await root.save();
    }

    const rootId = root.id;

    // Clean up any existing level1, level2, level3 users
    const emails = ["level1@womania.com", "level2@womania.com", "level3@womania.com"];
    const oldUsers = await User.find({ email: { $in: emails } });
    const oldUserIds = oldUsers.map(u => u.id);
    
    await User.deleteMany({ email: { $in: emails } });
    await Order.deleteMany({ userId: { $in: [rootId, ...oldUserIds] } });
    await SellPointLedger.deleteMany({ userId: { $in: [rootId, ...oldUserIds] } });
    await IncomeLedger.deleteMany({ userId: { $in: [rootId, ...oldUserIds] } });
    await PartnerDashboard.deleteMany({ userId: { $in: [rootId, ...oldUserIds] } });

    // Ensure dashboard for root is clean
    await ensureDashboard(rootId);
    await PartnerDashboard.updateOne(
      { userId: rootId },
      {
        totalOrders: 0,
        totalReferrals: 0,
        walletBalance: 0,
        sellPointsTotal: 0,
        activeDirects: 0
      }
    );

    // 2. Create Level 1 User (Referred by Root)
    const l1Id = crypto.randomUUID();
    const l1 = new User({
      id: l1Id,
      firstName: "Level 1",
      lastName: "Partner",
      name: "Level 1 Partner",
      email: "level1@womania.com",
      role: "partner",
      rank: "Starter",
      referralCode: "LEVEL1DU",
      uplineId: rootId,
      teamIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    await l1.save();
    await ensureDashboard(l1Id);

    // Link Level 1 to Root
    root.teamIds = [l1Id];
    await root.save();

    // 3. Create Level 2 User (Referred by Level 1)
    const l2Id = crypto.randomUUID();
    const l2 = new User({
      id: l2Id,
      firstName: "Level 2",
      lastName: "Partner",
      name: "Level 2 Partner",
      email: "level2@womania.com",
      role: "partner",
      rank: "Starter",
      referralCode: "LEVEL2GU",
      uplineId: l1Id,
      teamIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    await l2.save();
    await ensureDashboard(l2Id);

    // Link Level 2 to Level 1
    l1.teamIds = [l2Id];
    await l1.save();

    // 4. Create Level 3 User (Referred by Level 2)
    const l3Id = crypto.randomUUID();
    const l3 = new User({
      id: l3Id,
      firstName: "Level 3",
      lastName: "Partner",
      name: "Level 3 Partner",
      email: "level3@womania.com",
      role: "partner",
      rank: "Starter",
      referralCode: "LEVEL3GGU",
      uplineId: l2Id,
      teamIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    await l3.save();
    await ensureDashboard(l3Id);

    // Link Level 3 to Level 2
    l2.teamIds = [l3Id];
    await l2.save();

    console.log("Seeded MLM chain: Root -> L1 -> L2 -> L3.");

    const usersMap = {
      [rootId]: { email: "root@womania.com", name: "Root" },
      [l1Id]: { email: "level1@womania.com", name: "Level 1" },
      [l2Id]: { email: "level2@womania.com", name: "Level 2" },
      [l3Id]: { email: "level3@womania.com", name: "Level 3" }
    };

    // 5. Seed 1 Delivered Order of ₹1,000 (200 SP) for each user
    const userIds = [rootId, l1Id, l2Id, l3Id];
    let orderNumCounter = 9001;

    for (const userId of userIds) {
      const orderId = crypto.randomUUID();
      const orderNum = `${orderNumCounter++}`;
      
      const newOrder = new Order({
        id: orderId,
        userId: userId,
        orderNumber: orderNum,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        total: "₹1,000",
        sellPoints: 200,
        status: "Delivered",
        statusText: "Delivered",
        paymentMethod: "cod",
        address: {
          fullName: usersMap[userId].name,
          phone: "9999999999",
          streetAddress: "Fashion Plaza",
          city: "New Delhi",
          state: "Delhi",
          pincode: "110001"
        },
        items: [{
          productId: "traditional-1",
          quantity: 1,
          qty: 1,
          price: "₹1,000",
          sellPoints: 200,
          sku: "SAREE-PREM",
          name: "MLM Premium Saree"
        }],
        createdAt: new Date().toISOString()
      });
      await newOrder.save();

      // Log points credit
      const spLedger = new SellPointLedger({
        id: crypto.randomUUID(),
        userId: userId,
        orderId: orderId,
        sellPrice: 1000,
        sellPoints: 200,
        type: "Credit",
        status: "approved",
        remarks: `Delivered Order ${orderNum}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      await spLedger.save();

      // Accumulate stats for purchaser
      await PartnerDashboard.updateOne(
        { userId: userId },
        {
          $inc: {
            totalOrders: 1,
            sellPriceTotal: 1000,
            sellPointsTotal: 200
          }
        }
      );

      // Traversal and credit commissions up to 3 levels
      // Self: 10%
      const selfIncome = 20; // 200 * 10%
      await new IncomeLedger({
        id: crypto.randomUUID(),
        userId: userId,
        month: "2026-06",
        incomeType: "Self Sell Income",
        amount: selfIncome,
        sellPointsBasis: 200,
        status: "approved",
        remarks: `Self Sell Income (10%) for Order ${orderNum}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }).save();

      await PartnerDashboard.updateOne(
        { userId: userId },
        { $inc: { walletBalance: selfIncome } }
      );

      // Traversal logic
      let currentUplineId = (await User.findOne({ id: userId }))?.uplineId;
      let level = 1;

      while (currentUplineId && level <= 3) {
        const rate = level === 1 ? 0.05 : level === 2 ? 0.03 : 0.02;
        const levelIncome = 200 * rate; // 200 SP basis

        await new IncomeLedger({
          id: crypto.randomUUID(),
          userId: currentUplineId,
          month: "2026-06",
          incomeType: "Fast Track Income",
          amount: levelIncome,
          sellPointsBasis: 200,
          status: "approved",
          remarks: `Level ${level} Fast Track Income (${rate * 100}%) from ${usersMap[userId].name} (Order ${orderNum})`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }).save();

        await PartnerDashboard.updateOne(
          { userId: currentUplineId },
          { $inc: { walletBalance: levelIncome } }
        );

        // Also credit downline SP to upline's total SP
        await PartnerDashboard.updateOne(
          { userId: currentUplineId },
          { $inc: { sellPointsTotal: 200 } }
        );

        const uplineUser = await User.findOne({ id: currentUplineId });
        currentUplineId = uplineUser?.uplineId;
        level++;
      }
    }

    // Update activeDirects & totalReferrals for all nodes
    for (const userId of userIds) {
      const userObj = await User.findOne({ id: userId });
      if (userObj) {
        const directReferralsCount = userObj.teamIds ? userObj.teamIds.length : 0;
        
        // Find total referrals (recursive)
        let allReferralsCount = 0;
        const queue = [...(userObj.teamIds || [])];
        while (queue.length > 0) {
          const nextId = queue.shift();
          allReferralsCount++;
          const childObj = await User.findOne({ id: nextId });
          if (childObj && childObj.teamIds) {
            queue.push(...childObj.teamIds);
          }
        }

        await PartnerDashboard.updateOne(
          { userId: userId },
          {
            totalReferrals: allReferralsCount,
            activeDirects: directReferralsCount
          }
        );
      }
    }

    console.log("Seeding complete! Commissions calculated and wallets credited.");
    
    // Print summary
    for (const userId of userIds) {
      const dbStats = await PartnerDashboard.findOne({ userId });
      console.log(`User: ${usersMap[userId].name}`);
      console.log(`  Wallet Balance: ₹${dbStats?.walletBalance}`);
      console.log(`  Total SP: ${dbStats?.sellPointsTotal} SP`);
      console.log(`  Referrals: ${dbStats?.totalReferrals}`);
      console.log(`  Active Directs: ${dbStats?.activeDirects}`);
    }

  } catch (error) {
    console.error("Error running script:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
