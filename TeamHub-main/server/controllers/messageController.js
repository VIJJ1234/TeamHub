// Chat message controllers (added): list and create messages with optional file
import Message from '../models/messageModel.js';
import Team from '../models/teamModel.js';

export const listTeamMessages = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user._id;

    const team = await Team.findById(teamId).select('_id members createdBy');
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const isMember = team.members.some(m => m.toString() === userId.toString());
    const isCreator = team.createdBy.toString() === userId.toString();
    if (!isMember && !isCreator) {
      return res.status(403).json({ message: 'Not authorized to view messages' });
    }

    const messages = await Message.find({ teamId })
      .populate('sender', 'username email profilePicture')
      .sort({ createdAt: 1 });

    return res.json({ messages });
  } catch (err) {
    console.error('List messages error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createMessage = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const team = await Team.findById(teamId).select('_id members createdBy');
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const isMember = team.members.some(m => m.toString() === userId.toString());
    const isCreator = team.createdBy.toString() === userId.toString();
    if (!isMember && !isCreator) {
      return res.status(403).json({ message: 'Not authorized to post messages' });
    }

    const file = req.file;
    const newMsg = await Message.create({
      teamId,
      sender: userId,
      text: text || '',
      fileUrl: file ? `/uploads/${file.filename}` : '',
      fileName: file ? file.originalname : '',
      fileType: file ? file.mimetype : '',
    });

    await newMsg.populate('sender', 'username email profilePicture');
    return res.status(201).json({ message: newMsg });
  } catch (err) {
    console.error('Create message error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


