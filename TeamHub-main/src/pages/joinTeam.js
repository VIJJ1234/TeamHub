import React, { useContext, useEffect, useState } from "react";
import "../App.css";
import teamApi from "../apis/services/teamApi";
import Modal from "../components/Modal";
import { AuthContext } from "../context/AuthContext";

const JoinTeam = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [joinMessage, setJoinMessage] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [membersModal, setMembersModal] = useState({ open: false, team: null });
  const [selectedMember, setSelectedMember] = useState(null);
  const {currentUser} = useContext(AuthContext)
  // console.log("Current User:", currentUser._id);
    
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const { data } = await teamApi.listTeams();
        const mapped = (data.teams || []).map((t) => ({
          id: t._id,
          name: t.name,
          description: t.description,
          skills: t.skills || [],
          members: t.membersCount ?? 0,
          maxMembers: t.maxMembers,
          status: (t.membersCount ?? 0) < t.maxMembers ? "Open" : "Full",
          createdBy: t.createdBy,
          membersList: t.members || [],
        }));
        setTeams(mapped);
      } catch (err) {
        const message = err?.response?.data?.message || "Failed to load teams";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  const isTeamMember = (team)=>{
    return (team.membersList || []).some(member => member?._id === currentUser?._id);
  }

  const handleJoin = (team) => {
    setSelectedTeam(team);
    setShowJoinModal(true);
  };

  const handleJoinSubmit = async () => {
    try {
      if (!joinMessage.trim()) {
        setError("Please enter a message for your join request");
        return;
      }

      await teamApi.createJoinRequest({
        teamId: selectedTeam.id,
        message: joinMessage.trim(),
      });

      setSuccess(`Join request sent to ${selectedTeam.name}!`);
      setShowJoinModal(false);
      setJoinMessage("");
      setSelectedTeam(null);
      
      // Refresh teams list
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to send join request";
      setError(message);
    }
  };

  const handleCloseModal = () => {
    setShowJoinModal(false);
    setJoinMessage("");
    setSelectedTeam(null);
    setError("");
  };

  const filteredTeams = teams
    .filter((team) => team.name.toLowerCase().includes(search.toLowerCase()))
    .filter((team) => (showOnlyOpen ? team.status === "Open" : true));

  return (
    <div className="join-team-page">
      {/* Hero Section */}
      <div className="join-hero">
        <h1>Find Your Perfect Team</h1>
        <p>Collaborate, innovate, and achieve greatness together.</p>
        <input
          type="text"
          placeholder="🔍 Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-bar"
        />
        <div style={{ marginTop: 12 }}>
          <button
            className="join-btn"
            onClick={() => setShowOnlyOpen((v) => !v)}
            style={{ padding: '8px 12px' }}
          >
            {showOnlyOpen ? 'Show All Groups' : 'View Open Groups'}
          </button>
        </div>
      </div>

      {/* Team Cards */}
      <div className="team-list">
        {loading && <p>Loading teams...</p>}
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        {!loading && !error && filteredTeams.length > 0 ? (
          filteredTeams.map((team) => (
            <div key={team.id} className="team-card">
              <h2>{team.name}</h2>
              <p className="team-description">{team.description}</p>
              <div className="skills">
                {team.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
              <p className="members">
                {team.members} / {team.maxMembers} members
              </p>
              <p className="created-by">Created by: {team.createdBy?.username || 'Unknown'}</p>
              <span
                className={`status-badge ${
                  team.status === "Open" ? "open" : "full"
                }`}
              >
                {team.status}
              </span>
              <div style={{ marginTop: 8 }}>
                <button
                  className="join-btn"
                  onClick={() => setMembersModal({ open: true, team })}
                >
                  View Members
                </button>
              </div>
              
              {!isTeamMember(team) && (
                <button
                  className="join-btn"
                  disabled={team.status !== "Open" }
                  onClick={() => handleJoin(team)}
                >
                  {team.status === "Open" ? "Join Now" : "Full"}
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="no-teams">No teams match your search.</p>
        )}
      </div>

      {/* Join Request Modal */}
      {showJoinModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Request to Join {selectedTeam?.name}</h3>
            <p>Tell the team creator why you want to join:</p>
            <textarea
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
              placeholder="I want to join because..."
              rows="4"
              className="join-message-input"
            />
            {error && <p className="error-message">{error}</p>}
            <div className="modal-actions">
              <button onClick={handleCloseModal} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleJoinSubmit} className="submit-btn">
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members View Modal */}
      {membersModal.open && (
        <div className="modal-overlay" onClick={() => setMembersModal({ open: false, team: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Members of {membersModal.team?.name}</h3>
            <div className="team-members-grid" style={{ marginTop: 12 }}>
              {(membersModal.team?.membersList || []).map((member, idx) => {
                const src = member?.profilePicture;
                const image = src
                  ? (src.startsWith('http') ? src : `http://localhost:5000${src.startsWith('/') ? src : `/${src}`}`)
                  : 'https://cdn.vectorstock.com/i/1000v/92/16/default-profile-picture-avatar-user-icon-vector-46389216.jpg';
                return (
                  <div key={member?._id || idx} className="card" style={{ width: 180, cursor: 'pointer' }} onClick={() => setSelectedMember(member)}>
                    <img src={image} alt={member?.username || 'User'} className="profile-img" />
                    <h3>{member?.username || 'User'}</h3>
                    {member?.email && <p>{member.email}</p>}
                  </div>
                );
              })}
            </div>
            <div className="modal-actions">
              <button onClick={() => setMembersModal({ open: false, team: null })} className="cancel-btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Member Profile Modal */}
      {selectedMember && (
        <Modal profile={selectedMember} onClose={() => setSelectedMember(null)} />
      )}
    </div>
  );
};

export default JoinTeam;
