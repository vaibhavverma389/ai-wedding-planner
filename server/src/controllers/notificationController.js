import { Notification } from '../models/Notification.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const notificationController = {
  /**
   * Get notifications for authenticated user
   */
  async getNotifications(req, res, next) {
    try {
      const recipientId = req.user.id;
      const { unreadOnly = 'false', limit = 20 } = req.query;

      const filter = { recipientId };
      if (unreadOnly === 'true') {
        filter.isRead = false;
      }

      const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit, 10));

      const unreadCount = await Notification.countDocuments({ recipientId, isRead: false });

      return sendSuccess(
        res,
        {
          notifications,
          unreadCount
        },
        'Notifications retrieved.'
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mark single notification as read
   */
  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const notification = await Notification.findOneAndUpdate(
        { _id: id, recipientId: req.user.id },
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        return sendError(res, 'Notification not found.', 404, 'NOT_FOUND');
      }

      return sendSuccess(res, { notification }, 'Notification marked as read.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(req, res, next) {
    try {
      await Notification.updateMany({ recipientId: req.user.id, isRead: false }, { isRead: true });
      return sendSuccess(res, {}, 'All notifications marked as read.');
    } catch (error) {
      next(error);
    }
  }
};
