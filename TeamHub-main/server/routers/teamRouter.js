import express from 'express';
import { createTeam, listTeams, getTeamDetails } from '../controllers/teamController.js';
import { AuthenticationMiddleware } from '../middlewares/authHandlerMiddleware.js';

const router = express.Router();

router.get('/', listTeams);
router.post('/', AuthenticationMiddleware, createTeam);
router.get('/:teamId', AuthenticationMiddleware, getTeamDetails);

export default router;


