import express from 'express';
import { eventController } from '../controllers/eventController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/my-event', eventController.getMyEvent);
router.put('/my-event', eventController.updateEventDetails);

// Sub-events
router.post('/sub-events', eventController.addSubEvent);
router.delete('/sub-events/:id', eventController.deleteSubEvent);

// Budget expenses
router.post('/budget', eventController.addBudgetExpense);
router.delete('/budget/:id', eventController.deleteBudgetExpense);

// Tasks
router.post('/tasks', eventController.addTask);
router.patch('/tasks/:id/toggle', eventController.toggleTask);
router.delete('/tasks/:id', eventController.deleteTask);

// Guests & RSVP
router.post('/guests', eventController.addGuest);
router.delete('/guests/:id', eventController.deleteGuest);

export default router;
