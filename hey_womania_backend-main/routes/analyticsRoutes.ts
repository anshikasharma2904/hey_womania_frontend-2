import express from 'express';
import { trackEvent, getCustomAnalytics, getAddToCartEvents } from '../controllers/analyticsController';
import { optionalAuth, requireAdmin } from '../middlewares/authMiddleware';

const router = express.Router();

// Public endpoint for tracking
// Using optional auth to attach user if logged in
router.post('/event', optionalAuth, trackEvent);

// Admin only endpoints for dashboard & reports
router.get('/custom', requireAdmin, getCustomAnalytics);
router.get('/add-to-carts', requireAdmin, getAddToCartEvents);

export default router;
