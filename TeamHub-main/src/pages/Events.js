import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import eventsApi from '../apis/services/eventApi';
import './Events.css';

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching events...');
      
      const response = await eventsApi.getAllEvents();
      console.log('📡 Response status:', response.status);
      console.log('📦 Raw API response:', response.data);
      
      // Extract events from the nested structure
      if (response.data.success && Array.isArray(response.data.events)) {
        console.log('✅ Setting events:', response.data.events);
        setEvents(response.data.events);
      } else if (Array.isArray(response.data)) {
        // Fallback if API returns direct array
        console.log('✅ Setting events (direct array):', response.data);
        setEvents(response.data);
      } else {
        console.log('❌ Unexpected data structure');
        setEvents([]);
      }
      setError(null);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(`Network Error: ${err.message}`);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = (eventId, event) => {
    const status = getEventStatus(event);
    const isFull = isEventFull(event);
    const isExpired = isEventExpired(event);
    
    // Only navigate if event is joinable
    if (status === 'upcoming' || status === 'registration-closed' || isFull || isExpired) {
      return; // Don't navigate
    }
    
    navigate(`/join-event/${eventId}`);
  };

  const handleViewEvent = (eventId) => {
    // Navigate to event details page
    navigate(`/events/${eventId}`);
  };

  const handleCreateEvent = () => {
    navigate('/create-event');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const isEventFull = (event) => {
    const maxParticipants = event.participantRules?.maxParticipants || 0;
    const currentParticipants = event.participants?.length || 0;
    return maxParticipants > 0 && currentParticipants >= maxParticipants;
  };

  const isEventExpired = (event) => {
    const eventEndDate = event.dates?.eventEnd;
    if (!eventEndDate) return false;
    return new Date(eventEndDate) < new Date();
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const registrationStart = event.dates?.registrationStarts ? new Date(event.dates.registrationStarts) : null;
    const registrationEnd = event.dates?.registrationEnds ? new Date(event.dates.registrationEnds) : null;
    const eventStart = event.dates?.eventStart ? new Date(event.dates.eventStart) : null;
    const eventEnd = event.dates?.eventEnd ? new Date(event.dates.eventEnd) : null;

    if (registrationStart && now < registrationStart) return 'upcoming';
    if (registrationEnd && now > registrationEnd && eventStart && now < eventStart) return 'registration-closed';
    if (eventStart && eventEnd && now >= eventStart && now <= eventEnd) return 'ongoing';
    if (eventEnd && now > eventEnd) return 'completed';
    return 'active';
  };

  if (loading) {
    return (
      <div className="events-page">
        <div className="events-container">
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-page">
        <div className="events-container">
          <div className="error">
            <h2>Error Loading Events</h2>
            <p>{error}</p>
            <button className="action-button" onClick={fetchEvents}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="events-page">
      <div className="events-container">
        <div className="events-header">
          <h1>Events</h1>
          <p className="events-subtitle">Discover and join amazing events</p>
          <button 
            className="create-event-btn"
            onClick={handleCreateEvent}
          >
            Create New Event
          </button>
        </div>

        {events.length === 0 ? (
          <div className="no-events">
            <h2>No Events Found</h2>
            <p>Be the first to create an event!</p>
            <button 
              className="action-button"
              onClick={handleCreateEvent}
            >
              Create an Event
            </button>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => (
              <div key={event._id} className="event-card">
                <div className="event-header">
                  <h3>{event.title || 'Untitled Event'}</h3>
                  <span className={`event-status ${getEventStatus(event)}`}>
                    {getEventStatus(event).replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                
                {event.category && (
                  <div className={`category-badge ${event.category.toLowerCase()}`}>
                    {event.category}
                  </div>
                )}
                
                <div className="event-details">
                  <p className="event-description">
                    {event.description || 'No description available'}
                  </p>
                  
                  <div className="event-meta">
                    {event.dates?.registrationStarts && event.dates?.registrationEnds && (
                      <div className="meta-item">
                        <strong>Registration:</strong> 
                        {formatDate(event.dates.registrationStarts)} - {formatDate(event.dates.registrationEnds)}
                      </div>
                    )}
                    <div className="meta-item">
                      <strong>Event Start:</strong> {formatDate(event.dates?.eventStart)}
                    </div>
                    <div className="meta-item">
                      <strong>Event End:</strong> {formatDate(event.dates?.eventEnd)}
                    </div>
                    <div className="meta-item">
                      <strong>Location:</strong> {event.location || 'TBD'}
                    </div>
                    {event.eventLogistics?.eventMode && (
                      <div className="meta-item">
                        <strong>Mode:</strong> {event.eventLogistics.eventMode}
                      </div>
                    )}
                    {event.participantRules?.maxParticipants && (
                      <div className="meta-item">
                        <strong>Capacity:</strong> {event.participants?.length || 0}/{event.participantRules.maxParticipants}
                      </div>
                    )}
                    {event.participantRules?.minTeamSize && event.participantRules?.maxTeamSize && (
                      <div className="meta-item">
                        <strong>Team Size:</strong> {event.participantRules.minTeamSize} - {event.participantRules.maxTeamSize}
                      </div>
                    )}
                    {event.participantRules?.registrationFee > 0 && (
                      <div className="meta-item">
                        <strong>Fee:</strong> ₹{event.participantRules.registrationFee}
                      </div>
                    )}
                    <div className="meta-item">
                      <strong>Category:</strong> {event.category || 'General'}
                    </div>
                    {event.tags && event.tags.length > 0 && (
                      <div className="meta-item">
                        <strong>Tags:</strong> {event.tags.join(', ')}
                      </div>
                    )}
                    {event.createdBy && (
                      <div className="meta-item">
                        <strong>👤 Organizer:</strong> {event.createdBy.name || 'Event Organizer'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="event-actions">
                  <button 
                    className="view-btn"
                    onClick={() => handleViewEvent(event._id)}
                  >
                    View Details
                  </button>
                  
                  <button 
                    className={`join-btn ${isEventFull(event) ? 'full' : ''} ${isEventExpired(event) ? 'expired' : ''} ${getEventStatus(event) === 'upcoming' ? 'upcoming' : ''}`}
                    onClick={() => handleJoinEvent(event._id, event)}
                    disabled={isEventFull(event) || isEventExpired(event) || getEventStatus(event) === 'registration-closed' || getEventStatus(event) === 'upcoming'}
                  >
                    {isEventExpired(event) 
                      ? 'Event Ended' 
                      : isEventFull(event) 
                        ? 'Event Full' 
                        : getEventStatus(event) === 'registration-closed'
                          ? 'Registration Closed'
                          : getEventStatus(event) === 'upcoming'
                            ? 'Coming Soon'
                            : 'Join Event'
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
     
    </div>
  );
};

export default Events;