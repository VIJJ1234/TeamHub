import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Modal.css';

const Modal = ({ profile, onClose }) => {
  const navigate = useNavigate();
  const fallbackAvatar = 'https://cdn.vectorstock.com/i/1000v/92/16/default-profile-picture-avatar-user-icon-vector-46389216.jpg';
  const username = profile?.username || profile?.name || 'User';
  const email = profile?.email || '';
  const role = profile?.role || 'Member';
  const experience = profile?.experience;
  const location = profile?.location;
  const gender = profile?.gender;
  const age = profile?.age;
  const buildImageSrc = (src) => {
    if (!src) return fallbackAvatar;
    if (src.startsWith('http')) return src;
    return `http://localhost:5000${src.startsWith('/') ? src : `/${src}`}`;
  };
  const imageSrc = buildImageSrc(profile?.profilePicture || profile?.image);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{username}</h2>
        <img src={imageSrc} alt={username} className="profile-img" />
        {email && <p><strong>Email:</strong> {email}</p>}
        {role && <p><strong>Role:</strong> {role}</p>}
        {typeof experience !== 'undefined' && <p><strong>Experience:</strong> {experience} years</p>}
        {location && <p><strong>Location:</strong> {location}</p>}
        {gender && <p><strong>Gender:</strong> {gender}</p>}
        {typeof age !== 'undefined' && <p><strong>Age:</strong> {age}</p>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 12 }}>
          <button onClick={onClose}>Close</button>
          <button onClick={() => navigate(`/user/${profile?._id}`, { state: { user: profile } })}>
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
