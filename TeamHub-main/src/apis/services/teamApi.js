import axiosInstance from "../axiosInstance";

const Teams = '/teams';
const JoinRequests = '/join-requests';
const Messages = '/messages'; // added: chat API base path

const teamApi = {
  createTeam: (payload) => axiosInstance.post(`${Teams}`, payload),
  listTeams: () => axiosInstance.get(`${Teams}`),
  getTeamDetails: (teamId) => axiosInstance.get(`${Teams}/${teamId}`),
  // Chat endpoints
  listMessages: (teamId) => axiosInstance.get(`${Messages}/${teamId}`), // added: fetch chat messages
  sendMessage: (teamId, payload, config) => axiosInstance.post(`${Messages}/${teamId}`, payload, config), // added: send text/file
  createJoinRequest: (payload) => axiosInstance.post(`${JoinRequests}`, payload),
  getTeamJoinRequests: (teamId) => axiosInstance.get(`${JoinRequests}/team/${teamId}`),
  respondToJoinRequest: (requestId, action) => axiosInstance.patch(`${JoinRequests}/${requestId}/respond`, { action }),
  getUserJoinRequests: () => axiosInstance.get(`${JoinRequests}/user`),
  getUserJoinedTeams:()=> axiosInstance.get(`${JoinRequests}/joinedevent`),
};

export default teamApi;


