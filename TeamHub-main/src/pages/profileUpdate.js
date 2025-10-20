import React, { useEffect, useState, useContext, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import "../App.css";
import userApi from "../apis/services/userApi";
import { AuthContext } from "../context/AuthContext";

// Icons (you can replace with actual icon imports)
const TrophyIcon = () => <span>🏆</span>;
const TeamIcon = () => <span>👥</span>;
const ProjectIcon = () => <span>💼</span>;
const SkillIcon = () => <span>🔧</span>;
const EditIcon = () => <span>✏️</span>;
const SaveIcon = () => <span>💾</span>;
const AddIcon = () => <span>➕</span>;
const DeleteIcon = () => <span>🗑️</span>;

function ProfilePage() {
  const location = useLocation();
  const { userId } = useParams();
  const readOnly = Boolean(userId); // when routed as /user/:userId, show read-only dashboard
  const selectedUser = location?.state?.user;
  const { updateUser, currentUser } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    username: (readOnly && selectedUser?.username) || currentUser?.username || "",
    email: (readOnly && selectedUser?.email) || currentUser?.email || "",
    age: (readOnly && selectedUser?.age) || currentUser?.age || "",
    gender: (readOnly && selectedUser?.gender) || currentUser?.gender || "",
    role: (readOnly && selectedUser?.role) || currentUser?.role || "",
    roleDescription: (readOnly && selectedUser?.roleDescription) || currentUser?.roleDescription || "",
    experience: (readOnly && selectedUser?.experience) || currentUser?.experience || "",
    location: (readOnly && selectedUser?.location) || currentUser?.location || "",
    profilePicture: (readOnly && selectedUser?.profilePicture) || currentUser?.profilePicture || null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [newSkill, setNewSkill] = useState({ name: "", level: 50 });

  // Update profile when currentUser changes
  useEffect(() => {
    if (readOnly && selectedUser) {
      setProfile({
        username: selectedUser.username || "",
        email: selectedUser.email || "",
        age: selectedUser.age || "",
        gender: selectedUser.gender || "",
        role: selectedUser.role || "",
        roleDescription: selectedUser.roleDescription || "",
        experience: selectedUser.experience || "",
        location: selectedUser.location || "",
        profilePicture: selectedUser.profilePicture || null,
      });
    } else if (currentUser) {
      setProfile({
        username: currentUser.username || "",
        email: currentUser.email || "",
        age: currentUser.age || "",
        gender: currentUser.gender || "",
        role: currentUser.role || "",
        roleDescription: currentUser.roleDescription || "",
        experience: currentUser.experience || "",
        location: currentUser.location || "",
        profilePicture: currentUser.profilePicture || null,
      });
    }
  }, [readOnly, selectedUser, currentUser]);

  // No early returns before hooks to keep hook order stable; render-time guard below

  // Dummy data for visualizations
  const [stats, setStats] = useState({
    hackathons: {
      participated: 24,
      wins: 18,
      top3: 21
    },
    projects: 16,
    teams: 8,
    contributions: 127,
    streak: 15
  });

  // Skills with editable state
  const [skills, setSkills] = useState([
    { name: "Frontend", level: 92 },
    { name: "Backend", level: 85 },
    { name: "UI/UX Design", level: 78 },
    { name: "Presentation", level: 88 },
    { name: "Teamwork", level: 95 }
  ]);

  const [hackathonHistory, setHackathonHistory] = useState([
    { name: "Global Hackathon 2023", date: "Oct 2023", result: "1st Place", team: "CodeBreakers" },
    { name: "AI Innovation Challenge", date: "Aug 2023", result: "2nd Place", team: "NeuralNinjas" },
    { name: "Blockchain Buildathon", date: "Jun 2023", result: "1st Place", team: "ChainGang" },
    { name: "ClimateTech Hack", date: "Apr 2023", result: "3rd Place", team: "EcoWarriors" },
    { name: "FinTech Innovation", date: "Feb 2023", result: "1st Place", team: "MoneyMakers" },
  ]);

  const canvasRef = useRef(null);

  // Draw skill radar chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || skills.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    // ✨ FIX HERE: Increased the margin from 20 to 50 to give labels more space
    const radius = Math.min(width, height) / 2 - 50;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw radar circles
    ctx.strokeStyle = '#ff2a6d33';
    ctx.lineWidth = 1;
    
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * i / 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Draw axes
    const angle = (Math.PI * 2) / skills.length;
    
    ctx.strokeStyle = '#ff2a6d66';
    ctx.lineWidth = 1;
    
    skills.forEach((_, i) => {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle * i - Math.PI / 2) * radius, // Offset by -PI/2 to start at top
        centerY + Math.sin(angle * i - Math.PI / 2) * radius
      );
      ctx.stroke();
    });
    
    // Draw skill points
    ctx.fillStyle = '#ff2a6daa';
    skills.forEach((skill, i) => {
      const value = skill.level;
      const skillRadius = (value / 100) * radius;
      const x = centerX + Math.cos(angle * i - Math.PI / 2) * skillRadius;
      const y = centerY + Math.sin(angle * i - Math.PI / 2) * skillRadius;
      
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw skill labels
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const labelX = centerX + Math.cos(angle * i - Math.PI / 2) * (radius + 20);
      const labelY = centerY + Math.sin(angle * i - Math.PI / 2) * (radius + 20);
      
      ctx.fillText(skill.name, labelX, labelY);
    });
    
    // Draw skill area
    ctx.fillStyle = '#ff2a6d33';
    ctx.strokeStyle = '#ff2a6d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    skills.forEach((skill, i) => {
      const value = skill.level;
      const skillRadius = (value / 100) * radius;
      const x = centerX + Math.cos(angle * i - Math.PI / 2) * skillRadius;
      const y = centerY + Math.sin(angle * i - Math.PI / 2) * skillRadius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }, [skills]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await userApi.uploadAvatar(formData);
      if (data?.user) {
        setProfile((prev) => ({ ...prev, ...data.user }));
        updateUser(data.user);
      }
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const { profilePicture, ...updateData } = profile;
      const response = await userApi.updateUserProfile(updateData);
      setMessage("Profile updated successfully!");
      if (response?.data?.user) {
        updateUser(response.data.user);
      }
      setIsEditing(false);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update profile");
    }

    setTimeout(() => setMessage(""), 3000);
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    // Switch to edit tab when clicking edit button
    if (!isEditing) {
      setActiveTab("edit");
    }
  };

  const handleSkillChange = (index, field, value) => {
    const updatedSkills = [...skills];
    updatedSkills[index][field] = field === 'level' ? parseInt(value) : value;
    setSkills(updatedSkills);
  };

  const addNewSkill = () => {
    if (newSkill.name.trim() !== '') {
      setSkills([...skills, { name: newSkill.name, level: newSkill.level }]);
      setNewSkill({ name: "", level: 50 });
    }
  };

  const removeSkill = (index) => {
    const updatedSkills = [...skills];
    updatedSkills.splice(index, 1);
    setSkills(updatedSkills);
  };

  const defaultMaleAvatar = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  const defaultFemaleAvatar = "https://cdn-icons-png.flaticon.com/512/3135/3135789.png";
  const defaultNeutralAvatar = "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  const getDefaultAvatar = () => {
    if (profile.gender === "male") return defaultMaleAvatar;
    if (profile.gender === "female") return defaultFemaleAvatar;
    return defaultNeutralAvatar;
  };

  const buildImageSrc = (src) => {
    if (!src) return getDefaultAvatar();
    if (typeof src !== 'string') return getDefaultAvatar();
    if (src.startsWith('http')) return src;
    return `http://localhost:5000${src.startsWith('/') ? src : `/${src}`}`;
  };

  // Calculate win percentage
  const winPercentage = stats.hackathons.participated > 0 ? Math.round((stats.hackathons.wins / stats.hackathons.participated) * 100) : 0;

  if (readOnly && !selectedUser) {
    return (
      <div style={{ padding: 20 }}>
        <h2 style={{ color: '#ff4081' }}>User profile not available</h2>
        <p style={{ color: '#ccc' }}>Open from a members list or requests to view a user profile.</p>
      </div>
    );
  }

  return (
    <div className="profile-dashboard">
      {/* Animated background elements */}
      <div className="bg-animation">
        <div className="bg-circle-1"></div>
        <div className="bg-circle-2"></div>
        <div className="bg-circle-3"></div>
        <div className="bg-circle-4"></div>
      </div>
      
      <div className="dashboard-container">
        {/* Header */}
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          {!readOnly && (
            <button 
              className={`edit-toggle-btn ${isEditing ? 'active' : ''}`}
              onClick={toggleEdit}
            >
              {isEditing ? <SaveIcon /> : <EditIcon />}
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
          )}
        </header>

        <div className="dashboard-content">
          {/* Left Sidebar - Profile Overview */}
          <aside className="profile-sidebar">
            <div className="profile-card">
              <div className="profile-image-container">
                <img
                  src={buildImageSrc(profile.profilePicture)}
                  alt="Profile"
                  className="profile-image"
                />
                {!readOnly && (
                  <div className="change-photo-container">
                    <label htmlFor="profilePicInput" className="change-photo-btn">
                      Change Photo
                    </label>
                    <input
                      id="profilePicInput"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                  </div>
                )}
              </div>

              <div className="profile-info">
                <h2>{profile.username}</h2>
                <p className="profile-role">{profile.role}</p>
                <p className="profile-location">{profile.location}</p>
                
                <div className="profile-stats">
                  <div className="stat-item">
                    <span className="stat-number">{stats.hackathons.participated}</span>
                    <span className="stat-label">Hackathons</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{stats.hackathons.wins}</span>
                    <span className="stat-label">Wins</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{stats.teams}</span>
                    <span className="stat-label">Teams</span>
                  </div>
                </div>
              </div>

              <div className="win-rate-display">
                <h3>Win Ratio</h3>
                <div className="win-circle">
                  <div className="circle-bg">
                    <div 
                      className="circle-progress" 
                      style={{ 
                        background: `conic-gradient(#ff2a6d ${winPercentage * 3.6}deg, #333 ${winPercentage * 3.6}deg)` 
                      }}
                    ></div>
                    <div className="circle-text">
                      <span className="percentage">{winPercentage}%</span>
                      <span className="label">Win Rate</span>
                    </div>
                  </div>
                </div>
                <p className="win-stats">{stats.hackathons.wins} wins out of {stats.hackathons.participated} hackathons</p>
              </div>
            </div>

            <div className="current-streak">
              <h3>Current Streak</h3>
              <div className="streak-display">
                <div className="flame-icon">🔥</div>
                <span className="streak-count">{stats.streak} days</span>
              </div>
              <p>Consistent hacking streak</p>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="dashboard-main">
            <nav className="dashboard-tabs">
              <button 
                className={activeTab === "overview" ? "active" : ""}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </button>
              <button 
                className={activeTab === "skills" ? "active" : ""}
                onClick={() => setActiveTab("skills")}
              >
                Skills
              </button>
              <button 
                className={activeTab === "history" ? "active" : ""}
                onClick={() => setActiveTab("history")}
              >
                History
              </button>
              {!readOnly && (
                <button 
                  className={activeTab === "edit" ? "active" : ""}
                  onClick={() => setActiveTab("edit")}
                >
                  Edit Profile
                </button>
              )}
            </nav>

            <div className="tab-content">
              {activeTab === "overview" && (
                <div className="overview-tab">
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon">
                        <TrophyIcon />
                      </div>
                      <div className="stat-content">
                        <h3>{stats.hackathons.wins}</h3>
                        <p>Hackathon Wins</p>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon">
                        <TeamIcon />
                      </div>
                      <div className="stat-content">
                        <h3>{stats.teams}</h3>
                        <p>Teams Joined</p>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon">
                        <ProjectIcon />
                      </div>
                      <div className="stat-content">
                        <h3>{stats.projects}</h3>
                        <p>Projects Created</p>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon">
                        <SkillIcon />
                      </div>
                      <div className="stat-content">
                        <h3>{stats.contributions}</h3>
                        <p>Code Contributions</p>
                      </div>
                    </div>
                  </div>

                  <div className="hackathon-history">
                    <h3>Recent Hackathons</h3>
                    <div className="history-list">
                      {hackathonHistory.map((hackathon, index) => (
                        <div key={index} className="history-item">
                          <div className="hackathon-info">
                            <h4>{hackathon.name}</h4>
                            <p>{hackathon.date} • {hackathon.team}</p>
                          </div>
                          <div className={`hackathon-result ${hackathon.result.includes('1st') ? 'win' : ''}`}>
                            {hackathon.result}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "skills" && (
                <div className="skills-tab">
                  <h3>Skills Radar</h3>
                  <div className="radar-chart-container">
                    <canvas ref={canvasRef} width={400} height={400}></canvas>
                  </div>
                  
                  <div className="skills-management">
                    <h4>Manage Your Skills</h4>
                    <div className="add-skill-form">
                      <input
                        type="text"
                        placeholder="Skill name"
                        value={newSkill.name}
                        onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                        className="skill-input"
                      />
                      <div className="skill-level-input">
                        <span>Proficiency: {newSkill.level}%</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={newSkill.level}
                          onChange={(e) => setNewSkill({...newSkill, level: parseInt(e.target.value)})}
                        />
                      </div>
                      <button onClick={addNewSkill} className="add-skill-btn">
                        <AddIcon /> Add Skill
                      </button>
                    </div>
                    
                    <div className="skills-list">
                      {skills.map((skill, index) => (
                        <div key={index} className="skill-item">
                          <div className="skill-header">
                            <input
                              type="text"
                              value={skill.name}
                              onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                              className="skill-name-input"
                            />
                            <button 
                              onClick={() => removeSkill(index)} 
                              className="remove-skill-btn"
                              title="Remove skill"
                            >
                              <DeleteIcon />
                            </button>
                          </div>
                          <div className="skill-controls">
                            <span className="skill-value">{skill.level}%</span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={skill.level}
                              onChange={(e) => handleSkillChange(index, 'level', e.target.value)}
                              className="skill-level-slider"
                            />
                          </div>
                          <div className="skill-bar">
                            <div 
                              className="skill-progress" 
                              style={{ width: `${skill.level}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "history" && (
                <div className="history-tab">
                  <h3>Hackathon Participation History</h3>
                  <div className="timeline">
                    {hackathonHistory.map((item, index) => (
                      <div key={index} className="timeline-item">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <h4>{item.name}</h4>
                          <p className="timeline-date">{item.date}</p>
                          <p className="timeline-team">{item.team}</p>
                          <span className={`timeline-badge ${item.result.includes('1st') ? 'first' : item.result.includes('2nd') ? 'second' : 'third'}`}>
                            {item.result}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "edit" && !readOnly && (
                <div className="edit-tab">
                  <h3>Edit Profile</h3>
                  <form className="edit-profile-form" onSubmit={handleUpdate}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Username</label>
                        <input
                          type="text"
                          name="username"
                          value={profile.username}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          name="email"
                          value={profile.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Age</label>
                        <input
                          type="number"
                          name="age"
                          value={profile.age}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Gender</label>
                        <select
                          name="gender"
                          value={profile.gender}
                          onChange={handleChange}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Role</label>
                      <input
                        type="text"
                        name="role"
                        value={profile.role}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Role Description</label>
                      <textarea
                        name="roleDescription"
                        value={profile.roleDescription}
                        onChange={handleChange}
                      ></textarea>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Experience</label>
                        <input
                          type="text"
                          name="experience"
                          value={profile.experience}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Location</label>
                        <input
                          type="text"
                          name="location"
                          value={profile.location}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {message && (
                      <div className={`message ${message.includes('Failed') ? 'error' : 'success'}`}>
                        {message}
                      </div>
                    )}

                    <button type="submit" className="update-btn">
                      Save Changes
                    </button>
                  </form>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;