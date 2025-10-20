import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import teamApi from '../apis/services/teamApi';
import eventsApi from '../apis/services/eventApi';

const Home = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext);
  const [teams, setTeams] = useState([]);
  const [events, setEvents] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [teamsError, setTeamsError] = useState('');
  const [eventsError, setEventsError] = useState('');

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    const fetchTeams = async () => {
      setTeamsLoading(true);
      setTeamsError('');
      try {
        // Fetch teams from backend
        const response = await teamApi.listTeams();
        console.log('Teams fetched:', response.data);
        
        // Transform the data to match the expected format
        const transformedTeams = (response.data.teams || []).map(team => ({
          id: team._id,
          name: team.name,
          description: team.description,
          members: team.members || [],
          membersCount: team.membersCount || team.members?.length || 0,
          maxMembers: team.maxMembers,
          createdBy: team.createdBy,
          createdAt: team.createdAt,
          isFull: team.isFull
        }));
        
        setTeams(transformedTeams);
      } catch (error) {
        console.error('Error fetching teams:', error);
        setTeamsError('Failed to load teams. Please try again later.');
        setTeams([]); // Set empty array on error
      } finally {
        setTeamsLoading(false);
      }
    };

    const fetchEvents = async () => {
      setEventsLoading(true);
      setEventsError('');
      try {
        console.log('🔄 Fetching events for homepage...');
        
        const response = await eventsApi.getAllEvents();
        console.log('📡 Response status:', response.status);
        console.log('📦 Events API response:', response.data);
        
        // Handle the nested response structure from your Events.js
        let eventsArray = [];
        if (response.data.success && Array.isArray(response.data.events)) {
          eventsArray = response.data.events;
        } else if (Array.isArray(response.data)) {
          eventsArray = response.data;
        }
        
        console.log('✅ Events array:', eventsArray);
        
        // Transform the data to match the expected format
        const transformedEvents = eventsArray.map(event => ({
          id: event._id,
          name: event.title, // Using 'title' from your event structure
          description: event.description,
          category: event.category,
          mode: event.eventLogistics?.eventMode || 'online',
          venue: event.location,
          platform: event.eventLogistics?.platform,
          eventStart: event.dates?.eventStart,
          eventEnd: event.dates?.eventEnd,
          registrationStart: event.dates?.registrationStarts,
          registrationEnd: event.dates?.registrationEnds,
          registrationFee: event.participantRules?.registrationFee || 0,
          maxParticipants: event.participantRules?.maxParticipants,
          createdBy: event.createdBy,
          createdAt: event.createdAt,
          tags: event.tags || []
        }));
        
        console.log('🔄 Transformed events:', transformedEvents);
        
        // Improved filtering for upcoming events only
        const now = new Date();
        console.log('📅 Current time:', now.toISOString());
        
        const upcomingEvents = transformedEvents
          .filter(event => {
            // Check if event has valid dates
            if (!event.eventStart && !event.eventEnd) {
              console.log('⚠️ Event has no dates:', event.name);
              return false; // Skip events without dates
            }
            
            // Use event end date if available, otherwise use start date
            const eventDate = event.eventEnd ? new Date(event.eventEnd) : new Date(event.eventStart);
            
            // Check if the date is valid
            if (isNaN(eventDate.getTime())) {
              console.log('⚠️ Event has invalid date:', event.name, event.eventStart, event.eventEnd);
              return false; // Skip events with invalid dates
            }
            
            const isUpcoming = eventDate > now;
            
            console.log(`📅 Event: ${event.name}`);
            console.log(`   Start: ${event.eventStart}`);
            console.log(`   End: ${event.eventEnd}`);
            console.log(`   Comparing: ${eventDate.toISOString()} > ${now.toISOString()} = ${isUpcoming}`);
            
            return isUpcoming;
          })
          .sort((a, b) => {
            // Sort by event start date (earliest first)
            const dateA = new Date(a.eventStart || a.eventEnd);
            const dateB = new Date(b.eventStart || b.eventEnd);
            return dateA - dateB;
          })
          .slice(0, 6); // Limit to 6 events for homepage
        
        console.log('📅 Filtered upcoming events:', upcomingEvents);
        console.log(`📊 Total events: ${transformedEvents.length}, Upcoming: ${upcomingEvents.length}`);
        
        setEvents(upcomingEvents);
        setEventsError('');
      } catch (error) {
        console.error('❌ Error fetching events:', error);
        setEventsError('Failed to load events. Please try again later.');
        setEvents([]); // Set empty array on error
      } finally {
        setEventsLoading(false);
      }
    };

    fetchTeams();
    fetchEvents();
  }, []);

  const handleTeamClick = (team) => {
    navigate(`/team/${team.id}`, { state: { team } });
  };

  const handleEventClick = (event) => {
    navigate(`/events/${event.id}`); // Updated to match your events route
  };

  const handleJoinTeam = () => {
    navigate('/join-team'); // Navigate to teams page to browse and join
  };

  const handleCreateTeam = () => {
    navigate('/create-team');
  };

  const handleExploreEvents = () => {
    navigate('/events');
  };

  const handleJoinEvent = () => {
    navigate('/events'); // Navigate to events page to browse
  };

  const handleCreateEvent = () => {
    navigate('/create-event');
  };

  // Helper function to format date for display
  const formatEventDate = (eventStart, eventEnd) => {
    try {
      if (eventStart) {
        const startDate = new Date(eventStart);
        if (!isNaN(startDate.getTime())) {
          return startDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
        }
      }
      if (eventEnd) {
        const endDate = new Date(eventEnd);
        if (!isNaN(endDate.getTime())) {
          return endDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
        }
      }
      return 'TBD';
    } catch (error) {
      return 'TBD';
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-layout">
            <div className="hero-image">
              <img src="/teamhub_banner.png" alt="TeamHub Banner" className="hero-banner" />
            </div>
            <div className="hero-text">
              <h1 className="hero-title">Welcome to TeamHub</h1>
              <p className="hero-subtitle">
                Connect, Collaborate, and Create Amazing Projects & Events Together
              </p>
              
              {/* Action Buttons */}
              {isLoggedIn ? (
                <div className="hero-actions">
                  <button className="hero-btn primary" onClick={handleJoinTeam}>
                    Join a Team
                  </button>
                  <button className="hero-btn secondary" onClick={handleCreateTeam}>
                    Create Your Team
                  </button>
                  <button className="hero-btn tertiary" onClick={handleExploreEvents}>
                    Explore Events
                  </button>
                </div>
              ) : (
                <div className="hero-actions">
                  <Link to="/login" className="hero-btn primary">
                    Get Started
                  </Link>
                  <Link to="/signup" className="hero-btn secondary">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <h2 className="section-title">What is TeamHub?</h2>
          <div className="about-content">
            <div className="about-text">
              <p>
                TeamHub is a comprehensive collaborative platform designed to bring people together to work on exciting projects and participate in engaging events. 
                Whether you're a developer, designer, or have any other skill, TeamHub helps you find the perfect 
                team and discover amazing events to enhance your learning and networking experience.
              </p>
              <div className="features-grid">
                <div className="feature-item">
                  <div className="feature-icon">🤝</div>
                  <h3>Collaborate</h3>
                  <p>Work together with talented individuals from diverse backgrounds</p>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">🎯</div>
                  <h3>Join Events</h3>
                  <p>Participate in hackathons, workshops, competitions and more</p>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">📅</div>
                  <h3>Host Events</h3>
                  <p>Organize and manage your own events to bring the community together</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Action Cards Section */}
      <section className="features-showcase">
        <div className="container">
          <h2 className="section-title">Get Started</h2>
          <p className="section-subtitle">
            Choose how you'd like to participate in the community
          </p>
          
          {/* Action Cards */}
          <div className="features-cards">
            <div className="feature-card teams-card">
              <div className="feature-card-icon">👥</div>
              <h3>Teams</h3>
              <p>Create or join teams to work on collaborative projects. Share ideas, build together, and achieve your goals as a team.</p>
              <div className="feature-highlights">
                <span>• Project Collaboration</span>
                <span>• Skill Matching</span>
                <span>• Team Management</span>
              </div>
              {isLoggedIn && (
                <div className="feature-actions">
                  <button className="feature-btn primary" onClick={handleJoinTeam}>
                    Browse Teams
                  </button>
                  <button className="feature-btn secondary" onClick={handleCreateTeam}>
                    Create Team
                  </button>
                </div>
              )}
            </div>

            <div className="feature-card events-card">
              <div className="feature-card-icon">🎯</div>
              <h3>Events</h3>
              <p>Discover exciting events like hackathons, workshops, and competitions. Or organize your own events to engage the community.</p>
              <div className="feature-highlights">
                <span>• Hackathons & Competitions</span>
                <span>• Workshops & Webinars</span>
                <span>• Networking Events</span>
              </div>
              {isLoggedIn && (
                <div className="feature-actions">
                  <button className="feature-btn primary" onClick={handleJoinEvent}>
                    Browse Events
                  </button>
                  <button className="feature-btn secondary" onClick={handleCreateEvent}>
                    Create Event
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Explore Events */}
      <section className="events-showcase">
        <div className="container">
          <h2 className="section-title">Upcoming Events</h2>
          <p className="section-subtitle">
            Discover exciting events happening soon
          </p>
          
          {eventsLoading ? (
            <div className="loading-events">
              <div className="loading-spinner"></div>
              <p>Loading exciting events...</p>
            </div>
          ) : eventsError ? (
            <div className="error-events">
              <p>{eventsError}</p>
              <button className="retry-btn" onClick={() => window.location.reload()}>
                Try Again
              </button>
            </div>
          ) : events.length === 0 ? (
            <div className="no-events">
              <div className="no-events-content">
                <div className="no-events-icon">📅</div>
                <h3>No Upcoming Events</h3>
                <p>Be the first to create an exciting event for the community!</p>
                {isLoggedIn && (
                  <button className="create-event-btn" onClick={handleCreateEvent}>
                    Create First Event
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="events-grid">
              {events.map((event) => (
                <div key={event.id} className="event-showcase-card" onClick={() => handleEventClick(event)}>
                  <div className="event-card-header">
                    <div className="event-category">
                      <span className={`category-badge ${event.category?.toLowerCase() || 'general'}`}>
                        {event.category || 'Event'}
                      </span>
                    </div>
                    <h3>{event.name}</h3>
                    <div className="event-meta">
                      <span className="event-date">
                        📅 {formatEventDate(event.eventStart, event.eventEnd)}
                      </span>
                      <span className="event-mode">
                        {event.mode === 'online' ? '💻' : event.mode === 'offline' ? '📍' : '🔄'} {event.mode}
                      </span>
                    </div>
                  </div>
                  
                  <p className="event-description">
                    {event.description && event.description.length > 100 
                      ? `${event.description.substring(0, 100)}...` 
                      : event.description || 'No description available'
                    }
                  </p>
                  
                  <div className="event-details">
                    {event.mode !== 'online' && event.venue && (
                      <span className="event-venue">📍 {event.venue}</span>
                    )}
                    {event.mode !== 'offline' && event.platform && (
                      <span className="event-platform">💻 {event.platform}</span>
                    )}
                    {event.registrationFee > 0 && (
                      <span className="event-fee">💰 ₹{event.registrationFee}</span>
                    )}
                    {event.registrationFee === 0 && (
                      <span className="event-free">🆓 Free</span>
                    )}
                  </div>
                  
                  {event.tags && event.tags.length > 0 && (
                    <div className="event-tags">
                      {event.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="event-tag">
                          {tag}
                        </span>
                      ))}
                      {event.tags.length > 3 && (
                        <span className="event-tag-more">+{event.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                  
                  <div className="event-card-footer">
                    <span className="view-event">View Event →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {events.length > 0 && (
            <div className="view-all-events">
              <button className="view-all-btn" onClick={handleExploreEvents}>
                View All Events
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Teams Section */}
      <section className="teams-showcase">
        <div className="container">
          <h2 className="section-title">Active Teams</h2>
          <p className="section-subtitle">
            Join one of our active teams or get inspired to create your own
          </p>
          
          {teamsLoading ? (
            <div className="loading-teams">
              <div className="loading-spinner"></div>
              <p>Loading amazing teams...</p>
            </div>
          ) : teamsError ? (
            <div className="error-teams">
              <p>{teamsError}</p>
              <button className="retry-btn" onClick={() => window.location.reload()}>
                Try Again
              </button>
            </div>
          ) : teams.length === 0 ? (
            <div className="no-teams">
              <div className="no-teams-content">
                <div className="no-teams-icon">👥</div>
                <h3>No Teams Available</h3>
                <p>Be the first to create an amazing team!</p>
                {isLoggedIn && (
                  <button className="create-team-btn" onClick={handleCreateTeam}>
                    Create First Team
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="teams-grid">
              {teams.slice(0, 6).map((team) => (
                <div key={team.id} className="team-showcase-card" onClick={() => handleTeamClick(team)}>
                  <div className="team-card-header">
                    <h3>{team.name}</h3>
                    <span className="member-count">
                      {team.membersCount}/{team.maxMembers} members
                    </span>
                    <span className={`status-badge ${team.isFull ? 'full' : 'open'}`}>
                      {team.isFull ? 'Full' : 'Open'}
                    </span>
                  </div>
                  <p className="team-description">
                    {team.description && team.description.length > 100 
                      ? `${team.description.substring(0, 100)}...` 
                      : team.description || 'No description available'
                    }
                  </p>
                  {team.createdBy && (
                    <p className="team-creator">
                      Created by: {team.createdBy.username || team.createdBy.email}
                    </p>
                  )}
                  <div className="team-card-footer">
                    <span className="view-team">View Team →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {teams.length > 6 && (
            <div className="view-all-teams">
              <button className="view-all-btn" onClick={handleJoinTeam}>
                View All Teams
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
