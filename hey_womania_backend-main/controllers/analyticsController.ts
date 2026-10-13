import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AnalyticsEvent } from '../models/AnalyticsEvent';
import { Product } from '../models/Product';
import { User } from '../models/User';

export const trackEvent = async (req: Request, res: Response) => {
  try {
    const { eventType, url, sessionId, metadata } = req.body;
    const userId = (req as any).user?.id || (req as any).user?._id;

    if (!eventType || !url || !sessionId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const event = new AnalyticsEvent({
      eventType,
      url,
      userId,
      sessionId,
      metadata
    });

    await event.save();
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCustomAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to last 30 days
    const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate as string) : new Date();

    const dateFilter = { createdAt: { $gte: start, $lte: end } };

    // 1. Total Page Views
    const totalPageViews = await AnalyticsEvent.countDocuments({ ...dateFilter, eventType: 'page_view' });

    // 2. Total Add to Carts
    const totalAddToCarts = await AnalyticsEvent.countDocuments({ ...dateFilter, eventType: 'add_to_cart' });

    // 3. Top Pages
    const topPages = await AnalyticsEvent.aggregate([
      { $match: { ...dateFilter, eventType: 'page_view' } },
      { $group: { _id: '$url', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 10 }
    ]);

    // 4. Events over time (Group by Day)
    const eventsOverTime = await AnalyticsEvent.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            type: '$eventType'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          events: {
            $push: {
              type: '$_id.type',
              count: '$count'
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format eventsOverTime for frontend recharts
    const formattedEvents = eventsOverTime.map(day => {
      const formatted: any = { date: day._id };
      day.events.forEach((e: any) => {
        formatted[e.type] = e.count;
      });
      return formatted;
    });

    res.json({
      success: true,
      data: {
        totalPageViews,
        totalAddToCarts,
        topPages,
        eventsOverTime: formattedEvents
      }
    });
  } catch (error) {
    console.error('Error fetching custom analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAddToCartEvents = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));
    const search = (req.query.search as string || '').trim();
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const query: any = { eventType: 'add_to_cart' };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        if (endDate.length <= 10) {
          end.setHours(23, 59, 59, 999);
        }
        query.createdAt.$lte = end;
      }
    }

    if (search) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      
      const orConditions: any[] = [
        { url: searchRegex },
        { sessionId: searchRegex },
        { 'metadata.productName': searchRegex },
        { 'metadata.sku': searchRegex }
      ];

      // Match users by name, email, or phone
      const matchedUsers = await User.find({
        $or: [
          { name: searchRegex },
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { phone: searchRegex }
        ]
      }, { id: 1, _id: 1 }).lean();

      if (matchedUsers.length > 0) {
        const uids = matchedUsers.flatMap(u => [u.id, u._id?.toString()]).filter(Boolean);
        orConditions.push({ userId: { $in: uids } });
      }

      // Match products by title or slug
      const matchedProducts = await Product.find({
        $or: [
          { title: searchRegex },
          { slug: searchRegex }
        ]
      }, { slug: 1, id: 1 }).lean();

      if (matchedProducts.length > 0) {
        const pSlugs = matchedProducts.map(p => p.slug).filter(Boolean);
        const pIds = matchedProducts.map(p => p.id).filter(Boolean);
        pSlugs.forEach(s => {
          orConditions.push({ url: new RegExp(`/product/${s}`, 'i') });
        });
        if (pIds.length > 0) {
          orConditions.push({ 'metadata.productId': { $in: pIds } });
        }
      }

      query.$or = orConditions;
    }

    const total = await AnalyticsEvent.countDocuments(query);
    const rawEvents = await AnalyticsEvent.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Extract product slugs and IDs, and user IDs for batch resolution
    const slugs = new Set<string>();
    const productIds = new Set<string>();
    const userIds = new Set<string>();

    rawEvents.forEach((ev: any) => {
      if (ev.metadata?.productId) productIds.add(String(ev.metadata.productId));
      if (ev.metadata?.productSlug) slugs.add(String(ev.metadata.productSlug));

      if (ev.url) {
        const match = ev.url.match(/\/product\/([^/?#]+)/);
        if (match && match[1]) {
          try {
            slugs.add(decodeURIComponent(match[1]));
          } catch {
            slugs.add(match[1]);
          }
        }
      }

      if (ev.userId) {
        userIds.add(String(ev.userId));
      }
    });

    // Query products
    const productConditions: any[] = [];
    if (slugs.size > 0) productConditions.push({ slug: { $in: Array.from(slugs) } });
    if (productIds.size > 0) productConditions.push({ id: { $in: Array.from(productIds) } });

    const products = productConditions.length > 0
      ? await Product.find({ $or: productConditions }).lean()
      : [];

    const productBySlug = new Map<string, any>();
    const productById = new Map<string, any>();
    products.forEach((p: any) => {
      if (p.slug) productBySlug.set(p.slug.toLowerCase(), p);
      if (p.id) productById.set(p.id, p);
    });

    // Query users
    const userConditions: any[] = [];
    const validObjectIds: any[] = [];
    Array.from(userIds).forEach(uid => {
      userConditions.push({ id: uid });
      if (mongoose.Types.ObjectId.isValid(uid)) {
        validObjectIds.push(new mongoose.Types.ObjectId(uid));
      }
    });
    if (validObjectIds.length > 0) {
      userConditions.push({ _id: { $in: validObjectIds } });
    }

    const users = userConditions.length > 0
      ? await User.find({ $or: userConditions }).lean()
      : [];

    const userById = new Map<string, any>();
    users.forEach((u: any) => {
      if (u.id) userById.set(u.id, u);
      if (u._id) userById.set(String(u._id), u);
    });

    // Format events with product & user details
    const formattedEvents = rawEvents.map((ev: any, index: number) => {
      let slug: string | null = null;
      if (ev.url) {
        const match = ev.url.match(/\/product\/([^/?#]+)/);
        if (match && match[1]) {
          try {
            slug = decodeURIComponent(match[1]);
          } catch {
            slug = match[1];
          }
        }
      }

      const product = (slug && productBySlug.get(slug.toLowerCase())) ||
                      (ev.metadata?.productId && productById.get(String(ev.metadata.productId))) ||
                      null;

      const user = ev.userId ? userById.get(String(ev.userId)) : null;

      const productName = ev.metadata?.productName ||
                          product?.title ||
                          (slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : 'Unknown Product');

      const productImage = ev.metadata?.image ||
                           (product?.images && product.images[0]) ||
                           null;

      const price = ev.metadata?.price != null ? ev.metadata.price : (product?.salePrice || product?.price || null);

      return {
        _id: ev._id,
        serialNumber: (page - 1) * limit + index + 1,
        url: ev.url,
        sessionId: ev.sessionId,
        createdAt: ev.createdAt,
        product: {
          id: product?.id || ev.metadata?.productId || null,
          title: productName,
          slug: product?.slug || slug || null,
          image: productImage,
          price: price,
          sku: ev.metadata?.sku || null,
          quantity: ev.metadata?.quantity || 1,
          size: ev.metadata?.size || null,
          color: ev.metadata?.color || null
        },
        user: user ? {
          isGuest: false,
          id: user.id || user._id,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Customer',
          email: user.email || null,
          phone: user.phone || null,
          role: user.role || 'member'
        } : {
          isGuest: true,
          sessionId: ev.sessionId
        }
      };
    });

    res.json({
      success: true,
      data: formattedEvents,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    console.error('Error fetching add-to-cart events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

