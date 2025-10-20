import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import './EventDetails.css';

const EventDetails = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching event details for ID:', eventId);
      
      const response = await fetch(`http://localhost:5000/api/events/${eventId}`);
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Event not found');
        } else {
          const errorText = await response.text();
          setError(`API Error: ${response.status} - ${errorText}`);
        }
        return;
      }
      
      const data = await response.json();
      console.log('📦 Event details:', data);
      
      if (data.success && data.event) {
        setEvent(data.event);
      } else if (data._id) {
        // If API returns event directly
        setEvent(data);
      } else {
        setError('Invalid event data received');
      }
      setError(null);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(`Network Error: ${err.message}`);
    } finally {
      setLoading(false);
      // Scroll to top after loading completes
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    }
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  const handleJoinEvent = () => {
    // Only navigate if event is joinable
    const status = getEventStatus();
    if (status === 'upcoming' || status === 'registration-closed' || isEventFull() || isEventExpired()) {
      return; // Don't navigate
    }
    navigate(`/join-event/${eventId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
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

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatTimeOnly = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid time';
    }
  };

  const isEventFull = () => {
    if (!event) return false;
    const maxParticipants = event.participantRules?.maxParticipants || 0;
    const currentParticipants = event.participants?.length || 0;
    return maxParticipants > 0 && currentParticipants >= maxParticipants;
  };

  const isEventExpired = () => {
    if (!event) return false;
    const eventEndDate = event.dates?.eventEnd;
    if (!eventEndDate) return false;
    return new Date(eventEndDate) < new Date();
  };

  const getEventStatus = () => {
    if (!event) return 'unknown';
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
      <div className="event-details-page">
        <div className="event-details-container">
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="event-details-page">
        <div className="event-details-container">
          <div className="error">
            <h2>Error Loading Event</h2>
            <p>{error}</p>
            <div className="error-actions">
              <button className="btn-secondary" onClick={handleBack}>
                Go Back
              </button>
              <button className="btn-primary" onClick={fetchEventDetails}>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-details-page">
        <div className="event-details-container">
          <div className="no-event">
            <h2>Event Not Found</h2>
            <p>The event you're looking for doesn't exist or has been removed.</p>
            <button className="btn-primary" onClick={handleBack}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const eventStatus = getEventStatus();

  return (
    <div className="event-details-page">
      <div className="event-details-container">
        {/* Header with Back Button */}
        <div className="event-details-header">
          <button className="back-btn" onClick={handleBack}>
            ← Back
          </button>
          <div className="event-status-badge">
            <span className={`status-indicator ${eventStatus}`}>
              {eventStatus.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
        </div>

        {/* Main Event Content */}
        <div className="event-content">
          {/* Event Hero Section */}
          <div className="event-hero">
            <div className="event-title-section">
              <h1 className="event-title">{event.title}</h1>
              {event.category && (
                <div className={`category-badge ${event.category.toLowerCase()}`}>
                  {event.category}
                </div>
              )}
            </div>
            
            <div className="event-quick-info">
              <div className="quick-info-item">
                <span className="info-icon">📅</span>
                <div>
                  <strong>Event Date</strong>
                  <p>{formatDateOnly(event.dates?.eventStart)}</p>
                </div>
              </div>
              <div className="quick-info-item">
                <span className="info-icon">📍</span>
                <div>
                  <strong>Location</strong>
                  <p>{event.location || 'TBD'}</p>
                </div>
              </div>
              <div className="quick-info-item">
                <span className="info-icon">👥</span>
                <div>
                  <strong>Participants</strong>
                  <p>{event.participants?.length || 0}/{event.participantRules?.maxParticipants || '∞'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Event Description */}
          <div className="event-section">
            <h2 className="section-title">About This Event</h2>
            <p className="event-description">{event.description || 'No description available.'}</p>
          </div>

          {/* Event Details Grid */}
          <div className="event-details-grid">
            {/* Date & Time Info */}
            <div className="detail-card">
              <h3>📅 Date & Time</h3>
              <div className="detail-content">
                <div className="detail-item">
                  <strong>Registration Period:</strong>
                  <p>{formatDate(event.dates?.registrationStarts)} - {formatDate(event.dates?.registrationEnds)}</p>
                </div>
                <div className="detail-item">
                  <strong>Event Duration:</strong>
                  <p>{formatDate(event.dates?.eventStart)} - {formatDate(event.dates?.eventEnd)}</p>
                </div>
              </div>
            </div>

            {/* Location & Logistics */}
            <div className="detail-card">
              <h3>📍 Location & Logistics</h3>
              <div className="detail-content">
                <div className="detail-item">
                  <strong>Venue:</strong>
                  <p>{event.location || 'To be announced'}</p>
                </div>
                {event.eventLogistics?.eventMode && (
                  <div className="detail-item">
                    <strong>Mode:</strong>
                    <p>{event.eventLogistics.eventMode}</p>
                  </div>
                )}
                {event.eventLogistics?.platform && (
                  <div className="detail-item">
                    <strong>Platform:</strong>
                    <p>{event.eventLogistics.platform}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Participation Rules */}
            <div className="detail-card">
              <h3>👥 Participation Rules</h3>
              <div className="detail-content">
                {event.participantRules?.maxParticipants && (
                  <div className="detail-item">
                    <strong>Max Participants:</strong>
                    <p>{event.participantRules.maxParticipants}</p>
                  </div>
                )}
                {event.participantRules?.minTeamSize && event.participantRules?.maxTeamSize && (
                  <div className="detail-item">
                    <strong>Team Size:</strong>
                    <p>{event.participantRules.minTeamSize} - {event.participantRules.maxTeamSize} members</p>
                  </div>
                )}
                {event.participantRules?.registrationFee !== undefined && (
                  <div className="detail-item">
                    <strong>Registration Fee:</strong>
                    <p>{event.participantRules.registrationFee === 0 ? 'Free' : `₹${event.participantRules.registrationFee}`}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="detail-card">
              <h3>ℹ️ Additional Information</h3>
              <div className="detail-content">
                {event.tags && event.tags.length > 0 && (
                  <div className="detail-item">
                    <strong>Tags:</strong>
                    <div className="tags-container">
                      {event.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
                {event.createdBy && (
                  <div className="detail-item">
                    <strong>Organizer:</strong>
                    <p>{event.createdBy.name || 'Event Organizer'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="event-actions">
            <button 
              className={`join-event-btn ${isEventFull() ? 'full' : ''} ${isEventExpired() ? 'expired' : ''} ${eventStatus === 'upcoming' ? 'upcoming' : ''} ${eventStatus === 'registration-closed' ? 'closed' : ''}`}
              onClick={handleJoinEvent}
              disabled={isEventFull() || isEventExpired() || eventStatus === 'registration-closed' || eventStatus === 'upcoming'}
            >
              {isEventExpired() 
                ? 'Event Ended' 
                : isEventFull() 
                  ? 'Event Full' 
                  : eventStatus === 'registration-closed'
                    ? 'Registration Closed'
                    : eventStatus === 'upcoming'
                      ? 'Coming Soon'
                      : 'Join Event'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;