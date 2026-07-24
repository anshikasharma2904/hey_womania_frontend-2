import { Request, Response } from "express";
import { User } from "../models/User";
import { Order } from "../models/Order";

export const getCustomers = async (req: Request, res: Response) => {
  try {
    // Only fetch members and partners, exclude admins
    const customers = await User.find({ role: { $in: ["member", "partner"] } })
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    // Calculate total orders and spending for each customer
    const customersWithStats = await Promise.all(customers.map(async (customer) => {
      const orders = await Order.find({ userId: customer.id });
      
      const totalOrders = orders.length;
      const totalSpending = orders.reduce((sum, order) => {
        if (order.total) {
          const num = parseFloat(order.total.replace(/[^0-9.]/g, ""));
          return sum + (isNaN(num) ? 0 : num);
        }
        return sum;
      }, 0);

      return {
        ...customer.toObject(),
        totalOrders,
        totalSpending
      };
    }));

    res.json(customersWithStats);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const toggleCustomerBlock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    const customer = await User.findOneAndUpdate(
      { id, role: { $in: ["member", "partner"] } },
      { isBlocked, updatedAt: new Date().toISOString() },
      { new: true }
    ).select("-passwordHash");

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({ success: true, customer });
  } catch (error) {
    console.error("Error toggling customer block status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
