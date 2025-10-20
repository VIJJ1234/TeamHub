import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ProfileCard from '../components/ProfileCard';
import Modal from '../components/Modal';


const TeamDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { team } = location.state || {};
  const [selectedProfile, setSelectedProfile] = useState(null);
  
  // Use real authentication context instead of simulation
  const { isLoggedIn, currentUser } = useContext(AuthContext);

  // Debug logging
  console.log('TeamDetails rendered, isLoggedIn:', isLoggedIn);
  console.log('Team data:', team);
  console.log('members:', team?.members ? team.members.length : 0);
  
  // Use the passed team data or show a generic page
  const currentTeam = team || null;

  const handleProfileClick = (profile) => {
    setSelectedProfile(profile);
  };

  const handleCloseProfileModal = () => {
    setSelectedProfile(null);
  };

  const handleBackClick = () => {
    navigate('/');
  };

  // const handleJoinTeam = () => {
  //   // Implement join team logic here
  //   navigate('/join-team');
  // };

  // const handleCreateTeam = () => {
  //   // Navigate to create team page
  //   navigate('/create-team');
  // };

  // const handleLoginClick = () => {
  //   navigate('/login');
  // };

  // const handleSignupClick = () => {
  //   navigate('/signup');
  // };

  return (
    <div className="home">
      <div className="team-details-header">
        <button className="back-button" onClick={handleBackClick}>
          ← Back to Teams
        </button>
        <div className="team-info">
          <h1>{currentTeam ? currentTeam.name : "Team Details"}</h1>
          <p className="team-details-description">
            {currentTeam ? currentTeam.description : "Manage your team access and membership"}
          </p>
          {currentTeam && (
            <div className="team-stats">
              <span className="member-count-large">
                {currentTeam.members ? currentTeam.members.length : currentTeam.membersCount || 0} Team Members
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Conditional rendering based on authentication status */}
      {/* {isLoggedIn ? (
        <div className="team-actions-section">
          <div className="team-actions-container">
            <h3 className="team-actions-title">What would you like to do?</h3>
            <div className="team-actions-buttons">
              <button className="team-action-button join-button" onClick={handleJoinTeam}>
                Join A Team
              </button>
              <button className="team-action-button create-button" onClick={handleCreateTeam}>
                Create Your Team
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="auth-required-section">
          <div className="auth-required-container">
            <h3 className="auth-required-title">Authentication Required</h3>
            <p className="auth-required-message">
              You must be logged in to access the team details
            </p>
            <div className="auth-required-buttons">
              <button className="auth-button login-button" onClick={handleLoginClick}>
                Login
              </button>
              <button className="auth-button signup-button" onClick={handleSignupClick}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )} */}

      {/* Only show team members if team data exists and has members */}
      {currentTeam && currentTeam.members && currentTeam.members.length > 0 && (
        <div className="team-members-section">
          <div className="team-members-grid">
            {currentTeam.members.map((member, index) => {
              const isAdmin = member.email === currentTeam.createdBy?.email; // check admin
              return (
                <ProfileCard 
                  key={member._id || index} 
                  profile={{ ...member, isAdmin }} // pass admin info
                  onClick={handleProfileClick}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Profile Modal - Shows individual member details when profile card is clicked */}
      {selectedProfile && (
        <Modal profile={selectedProfile} onClose={handleCloseProfileModal} />
      )}
    </div>
  );
};

export default TeamDetails;
