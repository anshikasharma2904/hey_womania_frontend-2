import express from 'express';
import { trackEvent, getCustomAnalytics } from '../controllers/analyticsController';
import { optionalAuth, requireAdmin } from '../middlewares/authMiddleware';

const router = express.Router();

// Public endpoint for tracking
// Using optional auth to attach user if logged in
router.post('/event', optionalAuth, trackEvent);

// Admin only endpoint for dashboard
router.get('/custom', requireAdmin, getCustomAnalytics);

export default router;
