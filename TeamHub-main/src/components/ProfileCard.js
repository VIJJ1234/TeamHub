import React from 'react';
import './ProfileCard.css';

const ProfileCard = ({ profile, onClick }) => {
  const fallbackAvatar = 'https://cdn.vectorstock.com/i/1000v/92/16/default-profile-picture-avatar-user-icon-vector-46389216.jpg';
  const username = profile?.username || profile?.name || 'User';
  const email = profile?.email || '';
  const buildImageSrc = (src) => {
    if (!src) return fallbackAvatar;
    if (src.startsWith('http')) return src;
    // Backend serves static uploads at http://localhost:5000
    return `http://localhost:5000${src.startsWith('/') ? src : `/${src}`}`;
  };
  const imageSrc = buildImageSrc(profile?.profilePicture || profile?.image);
  return (
    <div className="card" onClick={() => onClick(profile)}>
      <img 
        src={imageSrc} 
        alt={username} 
        className="profile-img" 
      />
      <h3>{username}</h3>
      {email && <p>{email}</p>}

      {/* Show admin badge if user is the team creator */}
      {profile.isAdmin && (
        <span className="admin-badge">Admin</span>
      )}
    </div>
  );
};

export default ProfileCard;
