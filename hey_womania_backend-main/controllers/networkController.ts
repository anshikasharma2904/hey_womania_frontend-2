import { Request, Response } from "express";
import { User } from "../models/User";
import { SellPointLedger } from "../models/SellPointLedger";
import { Order } from "../models/Order";

export const getNetworkTree = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Level 1: direct referrals
    const level1Users = await User.find({ uplineId: userId, role: "partner" }, { id: 1, name: 1, firstName: 1, lastName: 1, email: 1, phone: 1, createdAt: 1, rank: 1, partnerProfile: 1, uplineId: 1 }).lean();
    const level1Ids = level1Users.map(u => u.id);

    // Level 2: referrals of level 1
    const level2Users = level1Ids.length > 0 ? await User.find({ uplineId: { $in: level1Ids }, role: "partner" }, { id: 1, name: 1, firstName: 1, lastName: 1, email: 1, phone: 1, createdAt: 1, rank: 1, uplineId: 1, partnerProfile: 1 }).lean() : [];
    const level2Ids = level2Users.map(u => u.id);

    // Level 3: referrals of level 2
    const level3Users = level2Ids.length > 0 ? await User.find({ uplineId: { $in: level2Ids }, role: "partner" }, { id: 1, name: 1, firstName: 1, lastName: 1, email: 1, phone: 1, createdAt: 1, rank: 1, uplineId: 1, partnerProfile: 1 }).lean() : [];

    // Calculate total sales for each user by checking their Orders
    const allIds = [...level1Ids, ...level2Ids, ...level3Users.map(u => u.id)];
    let salesMap: Record<string, number> = {};
    
    if (allIds.length > 0) {
      // Get all orders made by these users
      const orders = await Order.find({
        userId: { $in: allIds },
        status: { $nin: ["Cancelled", "Returned", "Refunded", "Return Requested"] }
      }).lean();
      
      orders.forEach(o => {
        if (!o.userId) return;
        const num = parseFloat((o.total || "").replace(/[^0-9.]/g, ""));
        if (!isNaN(num)) {
          salesMap[o.userId as string] = (salesMap[o.userId as string] || 0) + num;
        }
      });
      
      // Also get all orders made by their CUSTOMERS (users who have them as uplineId but are role: "member")
      const customers = await User.find({ uplineId: { $in: allIds }, role: "member" }, { id: 1, uplineId: 1 }).lean();
      const customerMap = new Map();
      customers.forEach(c => customerMap.set(c.id, c.uplineId));
      
      if (customers.length > 0) {
        const customerOrders = await Order.find({
          userId: { $in: customers.map(c => c.id) },
          status: { $nin: ["Cancelled", "Returned", "Refunded", "Return Requested"] }
        }).lean();
        
        customerOrders.forEach(o => {
          if (!o.userId) return;
          const num = parseFloat((o.total || "").replace(/[^0-9.]/g, ""));
          if (!isNaN(num)) {
            const upId = customerMap.get(o.userId);
            if (upId) {
              salesMap[upId] = (salesMap[upId] || 0) + num;
            }
          }
        });
      }
    }

    const mapUser = (u: any) => ({
      id: u.id,
      username: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim(),
      email: u.email,
      phone: u.phone,
      joinedAt: u.createdAt,
      rankName: u.rank || "Starter",
      kycStatus: u.partnerProfile?.kycStatus || "Pending",
      businessUsdc: salesMap[u.id] || 0,
      uplineId: u.uplineId,
      children: [] as any[]
    });

    const l1 = level1Users.map(mapUser);
    const l2 = level2Users.map(mapUser);
    const l3 = level3Users.map(mapUser);

    // Build tree
    l2.forEach(n2 => {
      n2.children = l3.filter(n3 => n3.uplineId === n2.id);
    });
    l1.forEach(n1 => {
      n1.children = l2.filter(n2 => n2.uplineId === n1.id);
    });
    
    const rootUser = await User.findOne({ id: userId });
    
    // Calculate Root sales
    let rootSales = 0;
    const rootOrders = await Order.find({ userId, status: { $nin: ["Cancelled", "Returned", "Refunded", "Return Requested"] } }).lean();
    rootOrders.forEach(o => {
       const num = parseFloat((o.total || "").replace(/[^0-9.]/g, ""));
       if (!isNaN(num)) rootSales += num;
    });
    const rootCustomers = await User.find({ uplineId: userId, role: "member" }).lean();
    if (rootCustomers.length > 0) {
       const rcOrders = await Order.find({ userId: { $in: rootCustomers.map(c => c.id) }, status: { $nin: ["Cancelled", "Returned", "Refunded", "Return Requested"] } }).lean();
       rcOrders.forEach(o => {
         const num = parseFloat((o.total || "").replace(/[^0-9.]/g, ""));
         if (!isNaN(num)) rootSales += num;
       });
    }

    const tree = {
      username: rootUser?.name || `${rootUser?.firstName || ''} ${rootUser?.lastName || ''}`.trim(),
      rankName: rootUser?.rank || "Starter",
      businessUsdc: rootSales,
      children: l1
    };

    res.json({
      success: true,
      data: {
        level1: l1,
        level2: l2,
        level3: l3,
        tree
      }
    });

  } catch (error) {
    console.error("Error fetching network tree:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getNetworkOrders = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Find all users who have this partner in their ancestors
    const networkUsers = await User.find(
      { ancestors: userId }, 
      { id: 1, name: 1, firstName: 1, lastName: 1, email: 1, ancestors: 1, role: 1 }
    ).lean();
    
    if (networkUsers.length === 0) {
      return res.json({ success: true, orders: [] });
    }

    const networkUserIds = networkUsers.map((u: any) => u.id);
    const userMap: Record<string, any> = {};
    networkUsers.forEach((u: any) => {
      // Calculate level based on ancestors array position
      const partnerIndex = u.ancestors.indexOf(userId);
      const level = u.ancestors.length - partnerIndex;
      
      userMap[u.id] = {
        name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        email: u.email,
        level,
        role: u.role || 'user'
      };
    });

    // Fetch all orders from these users
    const orders = await Order.find({ userId: { $in: networkUserIds } })
      .sort({ createdAt: -1 })
      .lean();

    const formattedOrders = orders.map((o: any) => ({
      _id: o._id,
      orderNumber: o.orderNumber || o._id.toString().slice(-6).toUpperCase(),
      date: o.date || o.createdAt,
      total: o.total,
      status: o.status,
      items: o.items,
      customerName: userMap[o.userId]?.name || "Unknown",
      customerEmail: userMap[o.userId]?.email || "Unknown",
      level: userMap[o.userId]?.level || 0,
      role: userMap[o.userId]?.role || 'user'
    }));

    res.json({ success: true, orders: formattedOrders });
  } catch (error) {
    console.error("Error fetching network orders:", error);
    res.status(500).json({ error: "Server error" });
  }
};
