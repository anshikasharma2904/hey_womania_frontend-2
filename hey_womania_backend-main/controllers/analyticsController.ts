import { Request, Response } from 'express';
import { AnalyticsEvent } from '../models/AnalyticsEvent';

export const trackEvent = async (req: Request, res: Response) => {
  try {
    const { eventType, url, sessionId, metadata } = req.body;
    const userId = (req as any).user?._id;

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
