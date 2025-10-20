import express from 'express';
import { AuthenticationMiddleware } from '../middlewares/authHandlerMiddleware.js'; 

const router = express.Router();
import { 
    createEvent,
    getAllEvents,
    getEventById,
    joinEvent
 } from '../controllers/eventController.js';

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Private (Only logged-in users)
 */


//create Event Controller import 
router.post('/', AuthenticationMiddleware,createEvent);
router.get('/',getAllEvents);

// Add this route for getting single event
router.get('/:id', getEventById);

//join event
router.patch('/:id', AuthenticationMiddleware, joinEvent);

export default router;
