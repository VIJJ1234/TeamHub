import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import teamApi from '../apis/services/teamApi';
import JoinRequestsManager from '../components/JoinRequestsManager';
import '../App.css';

const MyTeams = () => {
  const navigate = useNavigate();
  const { isLoggedIn, currentUser, loading: authLoading } = useContext(AuthContext);
  const [createdTeams, setCreatedTeams] = useState([]); // added: split into created
  const [joinedTeams, setJoinedTeams] = useState([]); // added: and joined teams
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    if (currentUser && !authLoading) {
      fetchMyTeams();
    }
  }, [currentUser, authLoading]);

  const fetchMyTeams = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const { data } = await teamApi.listTeams();
      
      const allTeams = data.teams || [];
      const currentUserId = currentUser._id?.toString();

      const mine = allTeams.filter(team => { // added: teams I created
        const teamCreatorId = team.createdBy?._id?.toString();
        return teamCreatorId && currentUserId && teamCreatorId === currentUserId;
      });

      const joined = allTeams.filter(team => { // added: teams I joined (not creator)
        const teamCreatorId = team.createdBy?._id?.toString();
        if (!currentUserId) return false;
        // joined means I'm in members but not the creator
        const members = team.members || [];
        const isMember = members.some(m => (m?._id || m)?.toString() === currentUserId);
        const isCreator = teamCreatorId === currentUserId;
        return isMember && !isCreator;
      });

      setCreatedTeams(mine);
      setJoinedTeams(joined);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to load your teams";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
  };

  const handleBackToList = () => {
    setSelectedTeam(null);
  };

  const handleRequestUpdate = () => {
    fetchMyTeams();
  };

  const handleTeamChat = (teamId) => {
    navigate(`/team-chat/${teamId}`);
  };

  if (authLoading) {
    return <div className="my-teams-loading">Checking authentication...</div>;
  }

  if (!isLoggedIn) {
    return <div className="my-teams-error">Please log in to view your teams.</div>;
  }

  if (loading) {
    return <div className="my-teams-loading">Loading your teams...</div>;
  }

  if (error) {
    return <div className="my-teams-error">Error: {error}</div>;
  }

  if (selectedTeam) {
    return (
      <div className="my-teams-page">
        <div className="team-details-header">
          <button className="back-button" onClick={handleBackToList}>
            ← Back to My Teams
          </button>
          <div className="team-info">
            <h1>{selectedTeam.name}</h1>
            <p className="team-details-description">{selectedTeam.description}</p>
            <div className="team-stats">
              <span className="member-count-large">
                {selectedTeam.membersCount} / {selectedTeam.maxMembers} members
              </span>
            </div>
          </div>
        </div>
        <div className="team-actions" style={{ marginBottom: '1rem' }}>
          <button
            className="manage-team-btn"
            onClick={() => handleTeamChat(selectedTeam._id)}
          >
            Team Chat
          </button>
        </div>
        {(() => {
          const currentUserId = currentUser?._id?.toString();
          const creatorId = selectedTeam?.createdBy?._id?.toString();
          const isOwner = currentUserId && creatorId && currentUserId === creatorId;
          if (!isOwner) return null;
          return (
            <div className="team-management-section">
              <JoinRequestsManager 
                teamId={selectedTeam._id} 
                onRequestUpdate={handleRequestUpdate}
              />
            </div>
          );
        })()}
      </div>
    );
  }

  return (
    <div className="my-teams-page">
      <div className="my-teams-header">
        <h1>My Teams</h1>
        <p>Manage your teams and review join requests</p>
      </div>

      <div className="my-teams-section">
        <h2>Teams I Created</h2>
        {createdTeams.length === 0 ? (
          <div className="no-teams-message">
            <p>You haven't created any teams yet.</p>
            <button 
              className="create-team-btn"
              onClick={() => navigate('/create-team')}
            >
              Create Your First Team
            </button>
          </div>
        ) : (
          <div className="my-teams-list">
            {createdTeams.map((team) => (
              <div key={team._id} className="my-team-card">
                <div className="team-header">
                  <h3>{team.name}</h3>
                  <span className={`status-badge ${team.isFull ? 'full' : 'open'}`}>
                    {team.isFull ? 'Full' : 'Open'}
                  </span>
                </div>
                
                <p className="team-description">{team.description}</p>
                
                <div className="team-stats">
                  <span className="member-count">
                    {team.membersCount} / {team.maxMembers} members
                  </span>
                  <span className="created-date">
                    Created: {new Date(team.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="team-actions">
                  <button
                    className="manage-team-btn"
                    onClick={() => handleTeamSelect(team)}
                  >
                    Manage Team
                  </button>
                  <button
                    className="manage-team-btn"
                    onClick={() => handleTeamChat(team._id)}
                    style={{ marginLeft: '10px' }}
                  >
                    Team Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="my-teams-section" style={{ marginTop: '2rem' }}>
        <h2>Teams I Joined</h2>
        {joinedTeams.length === 0 ? (
          <div className="no-teams-message">
            <p>You haven't joined any teams yet.</p>
          </div>
        ) : (
          <div className="my-teams-list">
            {joinedTeams.map((team) => {
              const currentUserId = currentUser?._id?.toString();
              const creatorId = team?.createdBy?._id?.toString();
              const isOwner = currentUserId && creatorId && currentUserId === creatorId;
              return (
                <div key={team._id} className="my-team-card">
                  <div className="team-header">
                    <h3>{team.name}</h3>
                    <span className={`status-badge ${team.isFull ? 'full' : 'open'}`}>
                      {team.isFull ? 'Full' : 'Open'}
                    </span>
                  </div>
                  
                  <p className="team-description">{team.description}</p>
                  
                  <div className="team-stats">
                    <span className="member-count">
                      {team.membersCount} / {team.maxMembers} members
                    </span>
                    <span className="created-date">
                      Created: {new Date(team.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="team-actions">
                    {isOwner && (
                      <button
                        className="manage-team-btn"
                        onClick={() => handleTeamSelect(team)}
                      >
                        Manage Team
                      </button>
                    )}
                    <button
                      className="manage-team-btn"
                      onClick={() => handleTeamChat(team._id)}
                      style={{ marginLeft: isOwner ? '10px' : 0 }}
                    >
                      Team Chat
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTeams;
