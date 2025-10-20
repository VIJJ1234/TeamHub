import Team from '../models/teamModel.js';

export const createTeam = async (req, res) => {
  try {
    const { teamName, teamAim, description, maxMembers, skills } = req.body;

    if (!teamName || !teamAim || !maxMembers) {
      return res.status(400).json({ message: 'teamName, teamAim and maxMembers are required' });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const team = await Team.create({
      name: teamName,
      aim: teamAim,
      description: description || '',
      maxMembers: Number(maxMembers),
      skills: Array.isArray(skills) ? skills : [],
      createdBy: req.user._id,
      members: [req.user._id], // Creator is automatically the first member
    });

    // Populate creator details
    await team.populate('createdBy', 'username email profilePicture');
    await team.populate('members', 'username email profilePicture');

    return res.status(201).json({ message: 'Team created successfully', team });
  } catch (error) {
    console.error('Create team error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const listTeams = async (_req, res) => {
  try {
    const teams = await Team.find()
      .populate('createdBy', 'username email profilePicture')
      .populate('members', 'username email profilePicture role experience location age gender')
      .sort({ createdAt: -1 });
    
    // Ensure createdBy is properly populated
    const teamsWithCreator = teams.map(team => {
      if (!team.createdBy) {
        console.warn(`Team ${team._id} has no createdBy field`);
      }
      return team;
    });
    
    return res.json({ teams: teamsWithCreator });
  } catch (error) {
    console.error('List teams error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get team details with join requests (for team creator)
export const getTeamDetails = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user._id;

    const team = await Team.findById(teamId)
      .populate('createdBy', 'username email profilePicture')
      .populate('members', 'username email profilePicture role experience location age gender');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is team creator
    const isCreator = team.createdBy._id.toString() === userId.toString();
    const isMember = team.members.some(member => member._id.toString() === userId.toString());

    return res.json({
      team,
      isCreator,
      isMember,
      canJoin: !team.isFull && !isMember
    });
  } catch (error) {
    console.error('Get team details error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


