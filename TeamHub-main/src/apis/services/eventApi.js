import axiosInstance from '../axiosInstance';

// Base path for all event-related API endpoints
const Event = '/events'

// Event API service - handles all event-related API calls
const eventsApi= {
    // Get all available events (used on home page and events listing page)
    getAllEvents: () => axiosInstance.get(`${Event}`),
    
    // Get details of a specific event by ID (used on join event page)
    getEventById: (eventId) => axiosInstance.get(`${Event}/${eventId}`),
    
    // Join an event with a specific team (used when user selects a team to join with)
    joinEvent:({eventId,teamId})=>axiosInstance.patch(`${Event}/${eventId}`,{teamId}),
}

export default eventsApi;