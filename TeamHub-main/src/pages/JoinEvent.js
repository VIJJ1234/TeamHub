import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import eventsApi from "../apis/services/eventApi";
import "./JoinEvent.css";
import teamApi from "../apis/services/teamApi";

/**
 * JoinEvent Component
 * 
 * This component handles the team selection process when joining an event.
 * It fetches the event details and user's teams, then filters teams based on
 * the event's team size requirements. Only teams that meet the criteria are
 * shown to the user for selection.
 * 
 * Key Features:
 * - Fetches event details and team requirements
 * - Filters user's teams based on event requirements
 * - Shows visual indicators for team suitability
 * - Handles edge cases (no teams, no suitable teams)
 * - Validates team selection before joining
 */

const JoinEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    fetchEventAndTeams();
  }, [eventId]);

  // Fetch both event details and user's teams, then filter teams based on event requirements
  const fetchEventAndTeams = async () => {
    try {
      setLoading(true);
      
      // Fetch event details and user teams in parallel for better performance
      // This way we get all the data we need in one go
      const [eventResponse, teamsResponse] = await Promise.all([
        eventsApi.getEventById(eventId),
        teamApi.getUserJoinedTeams()
      ]);

      const eventData = eventResponse.data.event;
      setEvent(eventData);

      if (teamsResponse.data && teamsResponse.data.length > 0) {
        setTeams(teamsResponse.data);
        
        // Filter teams to only show those that meet the event's team size requirements
        // This prevents users from trying to join with teams that don't qualify
        const suitableTeams = teamsResponse.data.filter(team => {
          const teamSize = team.membersCount || 0;
          const minTeamSize = eventData.participantRules?.minTeamSize || 1;
          const maxTeamSize = eventData.participantRules?.maxTeamSize || 10;
          
          // Only include teams that fall within the allowed size range
          return teamSize >= minTeamSize && teamSize <= maxTeamSize;
        });
        
        setFilteredTeams(suitableTeams);
        
        // If no teams meet the requirements, inform the user and redirect
        if (suitableTeams.length === 0) {
          alert(`No suitable teams found. Event requires teams with ${eventData.participantRules?.minTeamSize || 1}-${eventData.participantRules?.maxTeamSize || 10} members.`);
          navigate("/my-teams");
        }
      } else {
        // User has no teams at all - redirect to create a team first
        navigate("/create-team");
      }
    } catch (error) {
      console.error("Failed to fetch event or teams:", error);
      alert("Failed to load event details. Please try again.");
      navigate("/events");
    } finally {
      setLoading(false);
    }
  };

  // Handle the actual event joining process
  const handleJoin = async () => {
    // Make sure user has selected a team before proceeding
    if (!selectedTeam) {
      alert("Please select a team first!");
      return;
    }

    const teamId = selectedTeam;
    console.log('Joining event with team:', teamId);
    
    try {
      // Send the join request to the backend
      await eventsApi.joinEvent({eventId, teamId});
      alert("Successfully joined event!");
      // Redirect back to events page after successful join
      navigate(`/events`);
    } catch (error) {
      console.error("Failed to join event:", error);
      alert("Failed to join event. Please try again.");
    }
  };

  if (loading) return <div className="join-event-page">Loading...</div>;

  return (
    <div className="join-event-page">
      <div className="join-event-container">
        <h2 className="join-title">Join Event</h2>
        
        {/* Display event information so users know the requirements */}
        {event && (
          <div className="event-info">
            <h3>{event.title}</h3>
            <p><strong>Team Size Requirements:</strong> {event.participantRules?.minTeamSize || 1} - {event.participantRules?.maxTeamSize || 10} members</p>
            <p><strong>Registration Fee:</strong> ₹{event.participantRules?.registrationFee || 0}</p>
          </div>
        )}

        <p>Select one of your suitable teams to join this event:</p>

        {/* Show filtered teams that meet the event requirements */}
        {filteredTeams.length > 0 ? (
          <div className="team-list">
            {filteredTeams.map((team) => (
              <div
                key={team._id}
                className={`team-card ${selectedTeam === team._id ? "selected" : ""}`}
                onClick={() => setSelectedTeam(team._id)}
              >
                <h3>{team.name}</h3>
                <p>Members: {team.membersCount}</p>
                <p>Max Members: {team.maxMembers}</p>
                <p>{team.isFull ? "Team is Full" : "Slots Available"}</p>
                {/* Visual indicator showing if team meets event requirements */}
                <div className="team-status">
                  <span className={`status-badge ${team.membersCount >= (event?.participantRules?.minTeamSize || 1) && team.membersCount <= (event?.participantRules?.maxTeamSize || 10) ? 'suitable' : 'unsuitable'}`}>
                    {team.membersCount >= (event?.participantRules?.minTeamSize || 1) && team.membersCount <= (event?.participantRules?.maxTeamSize || 10) ? 'Suitable' : 'Unsuitable'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Show helpful message when no teams meet the requirements */
          <div className="no-teams-message">
            <p>No suitable teams found for this event.</p>
            <p>Event requires teams with {event?.participantRules?.minTeamSize || 1}-{event?.participantRules?.maxTeamSize || 10} members.</p>
            <button className="form-btn secondary" onClick={() => navigate("/my-teams")}>
              Manage Teams
            </button>
          </div>
        )}

        {/* Only show join button if there are suitable teams available */}
        {filteredTeams.length > 0 && (
          <button className="form-btn primary" onClick={handleJoin}>
            Join with Selected Team
          </button>
        )}
      </div>
    </div>
  );
};

export default JoinEvent;