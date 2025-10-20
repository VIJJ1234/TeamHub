import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateEvent.css';

const CreateEvent = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
        window.scrollTo(0, 0);
      }, []);
  const [formData, setFormData] = useState({
    // Event Information
    eventName: '',
    description: '',
    category: '',
    tags: [],
    
    // Timeline
    registrationStart: '',
    registrationEnd: '',
    eventStart: '',
    eventEnd: '',
    
    // Participation Rules
    minTeamSize: 1,
    maxTeamSize: 1,
    eligibility: '',
    registrationFee: 0,
    maxParticipants: '',
    
    // Event Logistics
    venue: '',
    mode: 'offline', // online, offline, hybrid
    platform: '',
    resources: '',
    contact: '',
    
    // Media & Branding
    eventLogo: null,
    bannerImage: null,
    socialLinks: {
      website: '',
      twitter: '',
      linkedin: '',
      instagram: ''
    },
    
    // Payment Integration
    paymentRequired: false,
    paymentGateway: 'razorpay',
    merchantId: '',
    secretKey: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.eventName.trim()) newErrors.eventName = 'Event name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.registrationStart) newErrors.registrationStart = 'Registration start date is required';
    if (!formData.registrationEnd) newErrors.registrationEnd = 'Registration end date is required';
    if (!formData.eventStart) newErrors.eventStart = 'Event start date is required';
    if (!formData.eventEnd) newErrors.eventEnd = 'Event end date is required';
    if (!formData.venue && formData.mode !== 'online') newErrors.venue = 'Venue is required for offline events';
    if (!formData.platform && formData.mode !== 'offline') newErrors.platform = 'Platform is required for online events';
    
    if (new Date(formData.registrationEnd) <= new Date(formData.registrationStart)) {
      newErrors.registrationEnd = 'Registration end must be after start date';
    }
    
    if (new Date(formData.eventEnd) <= new Date(formData.eventStart)) {
      newErrors.eventEnd = 'Event end must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIsSubmitting(true);

  try {
    // Transform frontend formData → backend format
    const formattedData = {
      title: formData.eventName,
      description: formData.description,
      dates: {
        registrationStarts: formData.registrationStart,
        registrationEnds: formData.registrationEnd,
        eventStart: formData.eventStart,
        eventEnd: formData.eventEnd,
      },
      location: formData.mode === "offline" ? formData.venue : formData.platform,
      category: formData.category,
      tags: formData.tags,
      participantRules: {
        minTeamSize: formData.minTeamSize,
        maxTeamSize: formData.maxTeamSize,
        maxParticipants: formData.maxParticipants || null,
        registrationFee: formData.registrationFee,
        eligibilityCriteria: formData.eligibility,
      },
      eventLogistics: {
        eventMode: formData.mode,
        venueDetails: formData.venue,
        contactInformation: formData.contact,
      },
      prizesAndRewards: {
        prizes: "₹50,000 cash prize", // ⚡ later make dynamic field in form if needed
        certificates: true, // ⚡ later add checkbox in form if needed
      },
    };

    // Save structured data for payment page
    sessionStorage.setItem("eventFormData", JSON.stringify(formattedData));

    // Redirect to payment page with structured data
    navigate("/payment", { state: { eventData: formattedData } });

  } catch (error) {
    console.error("Error preparing event:", error);
    alert("Error preparing event. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="create-event-container">
      <div className="create-event-header">
        <h1>Create New Event</h1>
        <p>Fill in the details below to create your event</p>
      </div>

      <form onSubmit={handleSubmit} className="create-event-form">
        {/* Event Information Section */}
        <section className="form-section">
          <h2>Event Information</h2>
          
          <div className="form-group">
            <label htmlFor="eventName">Event Name *</label>
            <input
              type="text"
              id="eventName"
              name="eventName"
              value={formData.eventName}
              onChange={handleInputChange}
              className={errors.eventName ? 'error' : ''}
              placeholder="Enter event name"
            />
            {errors.eventName && <span className="error-message">{errors.eventName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={errors.description ? 'error' : ''}
              placeholder="Describe your event"
              rows="4"
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={errors.category ? 'error' : ''}
              >
                <option value="">Select category</option>
                <option value="hackathon">Hackathon</option>
                <option value="competition">Competition</option>
                <option value="workshop">Workshop</option>
                <option value="conference">Conference</option>
                <option value="meetup">Meetup</option>
                <option value="webinar">Webinar</option>
              </select>
              {errors.category && <span className="error-message">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags.join(', ')}
                onChange={handleTagsChange}
                placeholder="Enter tags separated by commas"
              />
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="form-section">
          <h2>Timeline</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="registrationStart">Registration Start *</label>
              <input
                type="datetime-local"
                id="registrationStart"
                name="registrationStart"
                value={formData.registrationStart}
                onChange={handleInputChange}
                className={errors.registrationStart ? 'error' : ''}
              />
              {errors.registrationStart && <span className="error-message">{errors.registrationStart}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="registrationEnd">Registration End *</label>
              <input
                type="datetime-local"
                id="registrationEnd"
                name="registrationEnd"
                value={formData.registrationEnd}
                onChange={handleInputChange}
                className={errors.registrationEnd ? 'error' : ''}
              />
              {errors.registrationEnd && <span className="error-message">{errors.registrationEnd}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="eventStart">Event Start *</label>
              <input
                type="datetime-local"
                id="eventStart"
                name="eventStart"
                value={formData.eventStart}
                onChange={handleInputChange}
                className={errors.eventStart ? 'error' : ''}
              />
              {errors.eventStart && <span className="error-message">{errors.eventStart}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="eventEnd">Event End *</label>
              <input
                type="datetime-local"
                id="eventEnd"
                name="eventEnd"
                value={formData.eventEnd}
                onChange={handleInputChange}
                className={errors.eventEnd ? 'error' : ''}
              />
              {errors.eventEnd && <span className="error-message">{errors.eventEnd}</span>}
            </div>
          </div>
        </section>

        {/* Participation Rules Section */}
        <section className="form-section">
          <h2>Participation Rules</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="minTeamSize">Minimum Team Size</label>
              <input
                type="number"
                id="minTeamSize"
                name="minTeamSize"
                value={formData.minTeamSize}
                onChange={handleInputChange}
                min="1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="maxTeamSize">Maximum Team Size</label>
              <input
                type="number"
                id="maxTeamSize"
                name="maxTeamSize"
                value={formData.maxTeamSize}
                onChange={handleInputChange}
                min="1"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="maxParticipants">Maximum Participants</label>
              <input
                type="number"
                id="maxParticipants"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleInputChange}
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div className="form-group">
              <label htmlFor="registrationFee">Registration Fee (₹)</label>
              <input
                type="number"
                id="registrationFee"
                name="registrationFee"
                value={formData.registrationFee}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="eligibility">Eligibility Criteria</label>
            <textarea
              id="eligibility"
              name="eligibility"
              value={formData.eligibility}
              onChange={handleInputChange}
              placeholder="Describe eligibility requirements"
              rows="3"
            />
          </div>
        </section>

        {/* Event Logistics Section */}
        <section className="form-section">
          <h2>Event Logistics</h2>
          
          <div className="form-group">
            <label htmlFor="mode">Event Mode</label>
            <select
              id="mode"
              name="mode"
              value={formData.mode}
              onChange={handleInputChange}
            >
              <option value="offline">Offline</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          {(formData.mode === 'offline' || formData.mode === 'hybrid') && (
            <div className="form-group">
              <label htmlFor="venue">Venue *</label>
              <input
                type="text"
                id="venue"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                className={errors.venue ? 'error' : ''}
                placeholder="Enter venue address"
              />
              {errors.venue && <span className="error-message">{errors.venue}</span>}
            </div>
          )}

          {(formData.mode === 'online' || formData.mode === 'hybrid') && (
            <div className="form-group">
              <label htmlFor="platform">Online Platform *</label>
              <input
                type="text"
                id="platform"
                name="platform"
                value={formData.platform}
                onChange={handleInputChange}
                className={errors.platform ? 'error' : ''}
                placeholder="e.g., Zoom, Google Meet, Microsoft Teams"
              />
              {errors.platform && <span className="error-message">{errors.platform}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="resources">Resources & Requirements</label>
            <textarea
              id="resources"
              name="resources"
              value={formData.resources}
              onChange={handleInputChange}
              placeholder="List any resources or requirements for participants"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact">Contact Information</label>
            <input
              type="text"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleInputChange}
              placeholder="Contact email or phone"
            />
          </div>
        </section>
        

        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Event...' : 'Next'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;