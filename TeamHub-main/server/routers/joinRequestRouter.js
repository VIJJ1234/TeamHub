import express from 'express';
import { 
  createJoinRequest, 
  getTeamJoinRequests, 
  respondToJoinRequest, 
  getUserJoinRequests,
  joinedUserEvents 
} from '../controllers/joinRequestController.js';
import { AuthenticationMiddleware } from '../middlewares/authHandlerMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(AuthenticationMiddleware);

// Create a join request
router.post('/', createJoinRequest);

// Get join requests for a specific team (team creator only)
router.get('/team/:teamId', getTeamJoinRequests);

// Respond to a join request (approve/reject)
router.patch('/:requestId/respond', respondToJoinRequest);

// Get user's own join requests
router.get('/user', getUserJoinRequests);

//get user join Events
router.get('/joinedevent',AuthenticationMiddleware,joinedUserEvents)
export default router;
