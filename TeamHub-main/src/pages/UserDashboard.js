import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

function UserDashboard() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { userId } = useParams();
  const user = state?.user;

  // If navigated directly without state, send back for now
  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <p>User profile not available. Please open from a request or members list.</p>
        <button className="back-to-teams-btn" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const buildImageSrc = (src) => {
    if (!src) return 'https://cdn.vectorstock.com/i/1000v/92/16/default-profile-picture-avatar-user-icon-vector-46389216.jpg';
    if (typeof src !== 'string') return 'https://cdn.vectorstock.com/i/1000v/92/16/default-profile-picture-avatar-user-icon-vector-46389216.jpg';
    if (src.startsWith('http')) return src;
    return `http://localhost:5000${src.startsWith('/') ? src : `/${src}`}`;
  };

  return (
    <div style={{ padding: 20 }}>
      <button className="back-to-teams-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <div style={{ maxWidth: 600, margin: '20px auto', background: '#1f1f1f', padding: 20, borderRadius: 12, border: '1px solid #333' }}>
        <div style={{ textAlign: 'center' }}>
          <img
            src={buildImageSrc(user.profilePicture)}
            alt={user.username || 'User'}
            style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff' }}
          />
          <h2 style={{ color: '#ff4081' }}>{user.username || 'User'}</h2>
          {user.email && <p style={{ color: '#ccc' }}>{user.email}</p>}
        </div>

        <div style={{ marginTop: 20, color: '#ddd' }}>
          {user.role && <p><strong>Role:</strong> {user.role}</p>}
          {user.roleDescription && <p><strong>Role Description:</strong> {user.roleDescription}</p>}
          {typeof user.experience !== 'undefined' && <p><strong>Experience:</strong> {user.experience} years</p>}
          {user.location && <p><strong>Location:</strong> {user.location}</p>}
          {typeof user.age !== 'undefined' && <p><strong>Age:</strong> {user.age}</p>}
          {user.gender && <p><strong>Gender:</strong> {user.gender}</p>}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;


