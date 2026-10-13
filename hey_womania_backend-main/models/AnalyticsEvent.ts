import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalyticsEvent extends Document {
  eventType: string; // 'page_view', 'add_to_cart', 'checkout', etc.
  url: string;
  userId?: any;
  sessionId: string;
  metadata?: any;
  createdAt: Date;
}

const analyticsEventSchema = new Schema<IAnalyticsEvent>({
  eventType: { type: String, required: true },
  url: { type: String, required: true },
  userId: { type: Schema.Types.Mixed },
  sessionId: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

export const AnalyticsEvent = mongoose.model<IAnalyticsEvent>('AnalyticsEvent', analyticsEventSchema);
