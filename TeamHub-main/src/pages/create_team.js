import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import teamApi from "../apis/services/teamApi";

function CreateTeam() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    teamName: "",
    teamAim: "",
    description: "",
    maxMembers: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Function to generate random teamId (UUID-like)
  const generateTeamId = () => {
    return "team_" + Math.random().toString(36).substr(2, 9);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Frontend validation
    if (!formData.teamName.trim()) {
      setError("Team name is required");
      return;
    }
    if (!formData.teamAim.trim()) {
      setError("Team aim is required");
      return;
    }
    if (!formData.maxMembers || formData.maxMembers < 2) {
      setError("Team must have at least 2 members");
      return;
    }

    setError("");
    setSuccess("");
    
    try {
      const payload = {
        teamName: formData.teamName,
        teamAim: formData.teamAim,
        description: formData.description,
        maxMembers: Number(formData.maxMembers || 2),
      };
      
      const { data } = await teamApi.createTeam(payload);
      
      setSuccess(`Team "${data.team.name}" created successfully!`);
      setTimeout(() => {
        navigate("/join-team");
      }, 1000);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to create team";
      setError(message);
    }
  };

  return (
    <div className="App">
      <h2 className="welcome-text-signup">Create your own Team!</h2>

      <div className="signup-box">
        <form className="add-profile-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="teamName"
            placeholder="Team Name"
            value={formData.teamName}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="teamAim"
            placeholder="Team Aim"
            value={formData.teamAim}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Team Description"
            value={formData.description}
            onChange={handleChange}
          ></textarea>

          <input
            type="number"
            name="maxMembers"
            placeholder="Max Members"
            value={formData.maxMembers}
            onChange={handleChange}
            min="2"
          />

          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <button type="submit" className="login-button">Create Team</button>
        </form>
      </div>
    </div>
  );
}

export default CreateTeam;
