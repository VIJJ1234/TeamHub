import Event from '../models/eventsModel.js';
import Team from '../models/teamModel.js';

const createEvent =  async (req, res) => {
  try {
    const {
      title,
      description,
      dates,
      location,
      category,
      tags,
      participantRules,
      eventLogistics,
      prizesAndRewards,
      sponsorsAndPartners,
      payment,
    } = req.body;

    // Create new Event
    const event = new Event({
      title,
      description,
      dates,
      location,
      createdBy: req.user._id, // from authMiddleware
      category,
      tags,
      participantRules,
      eventLogistics,
      prizesAndRewards,
      sponsorsAndPartners,
      payment,
    });

    await event.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event,
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'username email')   // show event creator
      .sort({ createdAt: -1 })
      .select(
        'title description dates location category tags createdBy participantsCount isRegistrationOpen isOngoing isFinished isFull'
      ) // only pick necessary fields
      .lean({ virtuals: true });

    res.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting event by ID:', id);
    
    const event = await Event.findById(id);
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    res.json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch event',
      error: error.message 
    });
  }
};

// Handle team joining an event - validates all requirements before allowing join
const joinEvent = async(req,res)=>{
  try{
    const { id } = req.params;
    const {teamId} = req.body;

    console.log('Joining event ID:', id, 'with team ID:', teamId);
    
    // Validate required parameters
    if(!id)return  res.status(400).json({success:false,message:'Event ID is required'});
    if(!teamId)return  res.status(400).json({success:false,message:'Team ID is required'});

    // Find the event and check if it exists
    const event = await Event.findById(id);
    if(!event) return res.status(404).json({success:false,message:'Event not found'});
    
    // Check various event status conditions before allowing join
    if(event.isFull) return res.status(400).json({success:false,message:'Event is full'});
    if(!event.isRegistrationOpen) return res.status(400).json({success:false,message:'Registration is closed for this event'});
    if(event.isOngoing) return res.status(400).json({success:false,message:'Event is already started'});
    if(event.isFinished) return res.status(400).json({success:false,message:'Event is already finished'});

    // Verify the team exists and get its member details
    const team = await Team.findById(teamId).populate('members');
    if(!team) return res.status(404).json({success:false,message:'Team not found'});

    // Prevent duplicate registrations - check if team is already participating
    if(event.participants.includes(teamId)){
      return res.status(400).json({success:false,message:'Team already joined this event'});
    }

    // Validate team size against event requirements
    // This ensures teams meet the minimum and maximum member requirements
    const teamSize = team.members ? team.members.length : 0;
    const minTeamSize = event.participantRules?.minTeamSize || 1;
    const maxTeamSize = event.participantRules?.maxTeamSize || 10;
    
    // Reject teams that don't meet size requirements
    if(teamSize < minTeamSize || teamSize > maxTeamSize) {
      return res.status(400).json({
        success: false, 
        message: `Team size (${teamSize}) does not meet event requirements (${minTeamSize}-${maxTeamSize} members)`
      });
    }
    // All validations passed - add team to event participants
    event.participants.push(teamId);
    await event.save();

    // Return success response with updated participant list
    res.json({success:true,message:'Team successfully joined the event',eventParticipents:event.participants});
  }catch(error){
    console.error('Error joining event:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
}

export  {
    createEvent,
    getAllEvents,
    joinEvent
}