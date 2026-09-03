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

    // Generate last 6 months list for charting
    const last6Months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push(d.toISOString().substring(0, 7)); // YYYY-MM
    }

    // Chart 1: Sales & Orders Data
    const salesData = last6Months.map(month => {
      const monthOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(month));
      const monthSales = monthOrders.reduce((sum, order) => {
        if (order.total) {
          const num = parseFloat(order.total.replace(/[^0-9.]/g, ""));
          return sum + (isNaN(num) ? 0 : num);
        }
        return sum;
      }, 0);
      
      const dateObj = new Date(month + "-01");
      const monthName = dateObj.toLocaleString('default', { month: 'short' });
      return { name: monthName, sales: monthSales, orders: monthOrders.length };
    });

    // Chart 2: Order Status Distribution
    const statusCounts = orders.reduce((acc: any, order) => {
      const status = order.status || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    const orderStatusData = Object.keys(statusCounts).map(status => ({
      name: status,
      value: statusCounts[status]
    }));

    // Chart 3: User Growth Data
    const allUsers = await User.find({}, { createdAt: 1 });
    const userGrowthData = last6Months.map(month => {
      const monthUsers = allUsers.filter(u => u.createdAt && (u.createdAt as any).toISOString().startsWith(month)).length;
      const dateObj = new Date(month + "-01");
      const monthName = dateObj.toLocaleString('default', { month: 'short' });
      return { name: monthName, users: monthUsers };
    });

    res.json({
      totalProducts,
      totalOrders,
      todayOrders,
      totalSales,
      pendingOrders,
      deliveredOrders,
      totalCustomers,
      pendingReturns,
      pendingRefunds,
      salesData,
      orderStatusData,
      userGrowthData
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
    
    const partnerStats = await Promise.all(partners.map(async p => {
      const nwBalance = p.partnerProfile?.networkWalletBalance || 0;
      totalNetworkBalances += nwBalance;
      return {
        id: p.id,
        name: p.name,
        email: p.email,
        networkWalletBalance: nwBalance,
        shoppingWalletBalance: p.partnerProfile?.walletBalance || 0,
        teamSize: await User.countDocuments({ role: "partner", ancestors: p.id })
      };
    }));

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

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select("-password");
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
