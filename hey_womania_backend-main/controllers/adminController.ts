import { Request, Response } from "express";
import { User } from "../models/User";
import { Order } from "../models/Order";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Basic User counts
    const totalCustomers = await User.countDocuments({ role: "member" });
    
    // Order stats
    const orders = await Order.find({});
    const totalOrders = orders.length;
    
    const pendingOrders = orders.filter(o => o.status === "Pending").length;
    const deliveredOrders = orders.filter(o => o.status === "Delivered").length;
    
    // Total sales calculation (removing currency symbols and converting to number)
    const totalSales = orders.reduce((sum, order) => {
      if (order.total) {
        const num = parseFloat(order.total.replace(/[^0-9.]/g, ""));
        return sum + (isNaN(num) ? 0 : num);
      }
      return sum;
    }, 0);

    // Today's orders
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const todayOrders = orders.filter(o => {
      if (!o.createdAt) return false;
      return o.createdAt.startsWith(today);
    }).length;

    // Placeholders for future modules
    const totalProducts = 0; 
    const pendingReturns = 0;
    const pendingRefunds = 0;

    res.json({
      totalProducts,
      totalOrders,
      todayOrders,
      totalSales,
      pendingOrders,
      deliveredOrders,
      totalCustomers,
      pendingReturns,
      pendingRefunds
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ error: "Internal server error fetching stats" });
  }
};

export const getCentralWalletStats = async (req: Request, res: Response) => {
  try {
    // 1. Total Platform Sales
    const orders = await Order.find({ status: { $ne: "Cancelled" } });
    const totalPlatformSales = orders.reduce((sum, order) => {
      if (order.total) {
        const num = parseFloat(order.total.replace(/[^0-9.]/g, ""));
        return sum + (isNaN(num) ? 0 : num);
      }
      return sum;
    }, 0);

    // 2. Active Partners and Wallets
    const partners = await User.find({ role: "partner" }, { 
      id: 1, name: 1, email: 1, phone: 1, partnerProfile: 1, teamIds: 1 
    });
    
    let totalNetworkBalances = 0;
    
    const partnerStats = partners.map(p => {
      const nwBalance = p.partnerProfile?.networkWalletBalance || 0;
      totalNetworkBalances += nwBalance;
      return {
        id: p.id,
        name: p.name,
        email: p.email,
        networkWalletBalance: nwBalance,
        shoppingWalletBalance: p.partnerProfile?.walletBalance || 0,
        teamSize: p.teamIds?.length || 0
      };
    });

    res.json({
      success: true,
      data: {
        totalPlatformSales,
        totalNetworkBalances,
        activePartnersCount: partners.length,
        partners: partnerStats.sort((a, b) => b.networkWalletBalance - a.networkWalletBalance)
      }
    });

  } catch (error) {
    console.error("Central Wallet Stats Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
