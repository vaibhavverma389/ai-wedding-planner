import { Event } from '../models/Event.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const eventController = {
  /**
   * Get or initialize customer's wedding planner
   */
  async getMyEvent(req, res, next) {
    try {
      const userId = req.user.id;
      let event = await Event.findOne({ userId });

      if (!event) {
        // Initialize default realistic Indian wedding structure
        const primaryDate = new Date();
        primaryDate.setDate(primaryDate.getDate() + 90);

        event = await Event.create({
          userId,
          weddingTitle: `${req.user.name}'s Grand Wedding`,
          brideName: 'Bride',
          groomName: 'Groom',
          primaryDate,
          totalBudget: 1500000,
          city: 'Delhi NCR',
          subEvents: [
            { name: 'Haldi Ceremony', date: new Date(Date.now() + 88 * 86400000), time: '10:00 AM', venue: 'Courtyard Lawn', guestCount: 80 },
            { name: 'Mehendi & Sangeet', date: new Date(Date.now() + 89 * 86400000), time: '05:00 PM', venue: 'Banquet Hall A', guestCount: 150 },
            { name: 'Mandap & Pheras', date: new Date(Date.now() + 90 * 86400000), time: '07:00 PM', venue: 'Royal Mandap Lawn', guestCount: 300 },
            { name: 'Grand Reception', date: new Date(Date.now() + 91 * 86400000), time: '08:00 PM', venue: 'Grand Ballroom', guestCount: 400 }
          ],
          budgetExpenses: [
            { category: 'Decor & Mandap', title: 'Royal Mandap & Floral Decor', estimatedCost: 350000, actualCost: 320000, isPaid: true },
            { category: 'Catering & Food', title: 'Royal Feast Catering (300 Plates)', estimatedCost: 450000, actualCost: 450000, isPaid: false },
            { category: 'Photography & Video', title: 'Candid & Drone Cinematography', estimatedCost: 200000, actualCost: 180000, isPaid: true },
            { category: 'Baraat & Cars', title: 'Vintage Car & Dhol Ensemble', estimatedCost: 75000, actualCost: 65000, isPaid: true },
            { category: 'Music, DJ & Lights', title: 'Sangeet DJ & Laser Sound Setup', estimatedCost: 100000, actualCost: 95000, isPaid: false }
          ],
          tasks: [
            { title: 'Finalize Mandap floral color palette', category: 'Decor', priority: 'HIGH', isCompleted: true },
            { title: 'Taste and confirm reception catering menu', category: 'Catering', priority: 'HIGH', isCompleted: false },
            { title: 'Book vintage convertible car for Baraat', category: 'Logistics', priority: 'MEDIUM', isCompleted: true },
            { title: 'Distribute bridal party wedding favors', category: 'Gifts', priority: 'LOW', isCompleted: false }
          ],
          guests: [
            { name: 'Sunita & Ramesh Verma', phone: '9811223344', side: 'MUTUAL', rsvpStatus: 'ATTENDING', attendingCount: 4, dietaryPreference: 'VEG' },
            { name: 'Amitabh Kapoor', phone: '9811223355', side: 'GROOM', rsvpStatus: 'PENDING', attendingCount: 2, dietaryPreference: 'NON_VEG' }
          ]
        });
      }

      // Compute live summaries
      const totalEstimated = event.budgetExpenses.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);
      const totalActual = event.budgetExpenses.reduce((sum, item) => sum + (item.actualCost || 0), 0);
      const totalPaid = event.budgetExpenses.filter(i => i.isPaid).reduce((sum, item) => sum + (item.actualCost || 0), 0);
      const totalGuests = event.guests.reduce((sum, g) => sum + (g.attendingCount || 1), 0);
      const confirmedGuests = event.guests.filter(g => g.rsvpStatus === 'ATTENDING').reduce((sum, g) => sum + (g.attendingCount || 1), 0);
      const tasksCompleted = event.tasks.filter(t => t.isCompleted).length;

      return sendSuccess(
        res,
        {
          event,
          analytics: {
            totalBudget: event.totalBudget,
            totalEstimated,
            totalActual,
            totalPaid,
            remainingBudget: Math.max(0, event.totalBudget - totalActual),
            totalTasks: event.tasks.length,
            tasksCompleted,
            tasksProgressPercent: event.tasks.length ? Math.round((tasksCompleted / event.tasks.length) * 100) : 0,
            totalGuests,
            confirmedGuests
          }
        },
        'Wedding event plan retrieved.'
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update overall wedding event details
   */
  async updateEventDetails(req, res, next) {
    try {
      const { weddingTitle, brideName, groomName, primaryDate, totalBudget, city } = req.body;
      const event = await Event.findOneAndUpdate(
        { userId: req.user.id },
        {
          $set: {
            ...(weddingTitle && { weddingTitle }),
            ...(brideName && { brideName }),
            ...(groomName && { groomName }),
            ...(primaryDate && { primaryDate }),
            ...(totalBudget !== undefined && { totalBudget }),
            ...(city && { city })
          }
        },
        { new: true, upsert: true }
      );

      return sendSuccess(res, { event }, 'Wedding event details updated successfully.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Sub-events management
   */
  async addSubEvent(req, res, next) {
    try {
      const { name, date, time, venue, guestCount } = req.body;
      const event = await Event.findOneAndUpdate(
        { userId: req.user.id },
        { $push: { subEvents: { name, date, time, venue, guestCount } } },
        { new: true }
      );
      return sendSuccess(res, { subEvents: event.subEvents }, 'Sub-event added.');
    } catch (error) {
      next(error);
    }
  },

  async deleteSubEvent(req, res, next) {
    try {
      const { id } = req.params;
      const event = await Event.findOneAndUpdate(
        { userId: req.user.id },
        { $pull: { subEvents: { _id: id } } },
        { new: true }
      );
      return sendSuccess(res, { subEvents: event.subEvents }, 'Sub-event removed.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Budget expenses management
   */
  async addBudgetExpense(req, res, next) {
    try {
      const { category, title, estimatedCost, actualCost, isPaid, notes } = req.body;
      const event = await Event.findOneAndUpdate(
        { userId: req.user.id },
        { $push: { budgetExpenses: { category, title, estimatedCost, actualCost, isPaid, notes } } },
        { new: true }
      );
      return sendSuccess(res, { budgetExpenses: event.budgetExpenses }, 'Budget expense added.');
    } catch (error) {
      next(error);
    }
  },

  async deleteBudgetExpense(req, res, next) {
    try {
      const { id } = req.params;
      const event = await Event.findOneAndUpdate(
        { userId: req.user.id },
        { $pull: { budgetExpenses: { _id: id } } },
        { new: true }
      );
      return sendSuccess(res, { budgetExpenses: event.budgetExpenses }, 'Budget expense removed.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Tasks checklist management
   */
  async addTask(req, res, next) {
    try {
      const { title, category, deadline, priority } = req.body;
      const event = await Event.findOneAndUpdate(
        { userId: req.user.id },
        { $push: { tasks: { title, category, deadline, priority, isCompleted: false } } },
        { new: true }
      );
      return sendSuccess(res, { tasks: event.tasks }, 'Task added.');
    } catch (error) {
      next(error);
    }
  },

  async toggleTask(req, res, next) {
    try {
      const { id } = req.params;
      const event = await Event.findOne({ userId: req.user.id });
      if (!event) return sendError(res, 'Event not found', 404);

      const task = event.tasks.id(id);
      if (!task) return sendError(res, 'Task not found', 404);

      task.isCompleted = !task.isCompleted;
      await event.save();

      return sendSuccess(res, { task, tasks: event.tasks }, 'Task status updated.');
    } catch (error) {
      next(error);
    }
  },

  async deleteTask(req, res, next) {
    try {
      const { id } = req.params;
      const event = await Event.findOneAndUpdate(
        { userId: req.user.id },
        { $pull: { tasks: { _id: id } } },
        { new: true }
      );
      return sendSuccess(res, { tasks: event.tasks }, 'Task deleted.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Guests & RSVP management
   */
  async addGuest(req, res, next) {
    try {
      const { name, phone, email, side, rsvpStatus, attendingCount, dietaryPreference } = req.body;
      const event = await Event.findOneAndUpdate(
        { userId: req.user.id },
        { $push: { guests: { name, phone, email, side, rsvpStatus, attendingCount, dietaryPreference } } },
        { new: true }
      );
      return sendSuccess(res, { guests: event.guests }, 'Guest added.');
    } catch (error) {
      next(error);
    }
  },

  async deleteGuest(req, res, next) {
    try {
      const { id } = req.params;
      const event = await Event.findOneAndUpdate(
        { userId: req.user.id },
        { $pull: { guests: { _id: id } } },
        { new: true }
      );
      return sendSuccess(res, { guests: event.guests }, 'Guest removed.');
    } catch (error) {
      next(error);
    }
  }
};
