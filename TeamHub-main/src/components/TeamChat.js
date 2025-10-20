import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import teamApi from '../apis/services/teamApi';
import './TeamChat.css';

const TeamChat = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [team, setTeam] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [onlineMembers, setOnlineMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [showPinned, setShowPinned] = useState(true);
  const messageRefs = useRef({});
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const emojis = ['😊', '😂', '❤️', '👍', '🔥', '🎉', '😢', '😠', '🤔', '😎', '😮', '👏'];

  // load team details and messages
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const { data } = await teamApi.getTeamDetails(teamId);
        setTeam(data.team);
        // Load messages from server
        const msgsRes = await teamApi.listMessages(teamId);
        const fetched = (msgsRes.data.messages || []).map(m => ({
          id: m._id,
          text: m.text,
          sender: m.sender,
          timestamp: m.createdAt,
          fileUrl: m.fileUrl,
          fileName: m.fileName,
          fileType: m.fileType,
        }));
        setMessages(fetched);
        setOnlineMembers([currentUser._id]);
      } catch (err) {
        setError('Failed to load team data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [teamId, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // send text message to server (changed)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const payload = { text: newMessage };
      const { data } = await teamApi.sendMessage(teamId, payload);
      const m = data.message;
      const message = {
        id: m._id,
        text: m.text,
        sender: m.sender,
        timestamp: m.createdAt,
        fileUrl: m.fileUrl,
        fileName: m.fileName,
        fileType: m.fileType,
      };
      setMessages((prevMessages) => [...prevMessages, message]);
      setNewMessage('');
      setShowEmojis(false);
    } catch (_err) {
      // noop for now
    }
  };

  const handlePinMessage = (message) => {
    if (!pinnedMessages.find(p => p.id === message.id)) {
      setPinnedMessages([message, ...pinnedMessages]);
    }
  };

  const handleUnpinMessage = (messageId) => {
    setPinnedMessages(pinnedMessages.filter(p => p.id !== messageId));
  };

  const scrollToMessage = (messageId) => {
    messageRefs.current[messageId]?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileAttachment = () => {
    fileInputRef.current.click();
  };

  // upload a file message to server 
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await teamApi.sendMessage(teamId, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const m = data.message;
        const message = {
          id: m._id,
          text: m.text,
          sender: m.sender,
          timestamp: m.createdAt,
          fileUrl: m.fileUrl,
          fileName: m.fileName,
          fileType: m.fileType,
        };
        setMessages((prevMessages) => [...prevMessages, message]);
      } catch (_err) {
        // noop for now
      }
    }
  };

  const addEmoji = (emoji) => {
    setNewMessage(newMessage + emoji);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="team-chat-container">
      <div className="team-chat-sidebar">
        <h3>Members ({team?.members.length})</h3>
        <ul>
          {team?.members.map((member) => (
            <li key={member._id}>
              <span className={onlineMembers.includes(member._id) ? 'online-indicator' : 'offline-indicator'}></span>
              {member.username}
            </li>
          ))}
        </ul>
      </div>
      <div className="chat-main">
        <div className="chat-header">
          <h2>{team?.name}</h2>
          <button className="back-to-teams-btn" onClick={() => navigate('/my-teams')}>
            Return to My Teams
          </button>
        </div>
        <div className="chat-content">
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} id={`message-${msg.id}`} ref={el => messageRefs.current[msg.id] = el} className="message">
                <img 
                  src={
                    msg.sender.profilePicture 
                      ? (msg.sender.profilePicture.startsWith('http') 
                          ? msg.sender.profilePicture 
                          : `http://localhost:5000${msg.sender.profilePicture.startsWith('/') ? msg.sender.profilePicture : `/${msg.sender.profilePicture}`}`)
                      : 'https://cdn.vectorstock.com/i/1000v/92/16/default-profile-picture-avatar-user-icon-vector-46389216.jpg'
                  } 
                  alt={msg.sender.username} 
                  className="message-avatar" 
                />
                <div className="message-content">
                  <div className="message-sender">{msg.sender.username}</div>
                  {msg.text && <p className="message-text">{msg.text}</p>}
                  {msg.fileUrl && (
                    <div className="message-file">
                      {msg.fileType && msg.fileType.startsWith('image/') ? (
                        <a href={`http://localhost:5000${msg.fileUrl}`} target="_blank" rel="noreferrer">
                          <img src={`http://localhost:5000${msg.fileUrl}`} alt={msg.fileName || 'attachment'} style={{ maxWidth: '240px', borderRadius: '8px' }} />
                        </a>
                      ) : msg.fileType && msg.fileType === 'application/pdf' ? (
                        <div style={{ marginTop: '8px' }}>
                          <a 
                            href={`http://localhost:5000${msg.fileUrl}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            style={{ 
                              color: '#ff4081', 
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 12px',
                              border: '1px solid #ff4081',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(255, 64, 129, 0.1)'
                            }}
                          >
                            📄 {msg.fileName || 'PDF Document'}
                          </a>
                        </div>
                      ) : (
                        <div style={{ marginTop: '8px' }}>
                          <a 
                            href={`http://localhost:5000${msg.fileUrl}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            style={{ 
                              color: '#ff4081', 
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 12px',
                              border: '1px solid #ff4081',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(255, 64, 129, 0.1)'
                            }}
                          >
                            📎 {msg.fileName || 'Download file'}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="message-actions">
                  <button onClick={() => handlePinMessage(msg)}>📌</button>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="pinned-messages-sidebar">
            <h3 onClick={() => setShowPinned(!showPinned)}>Pinned Messages</h3>
            {showPinned && pinnedMessages.map(msg => (
              <div key={msg.id} className="pinned-message">
                <div className="pinned-message-text" onClick={() => scrollToMessage(msg.id)}>
                  {msg.text}
                  <div className="pinned-message-time">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                </div>
                <button className="unpin-button" onClick={() => handleUnpinMessage(msg.id)}>x</button>
              </div>
            ))}
          </div>
        </div>
        <form className="chat-input" onSubmit={handleSendMessage}>
          {showEmojis && (
            <div className="emoji-picker">
              {emojis.map(emoji => (
                <button type="button" key={emoji} onClick={() => addEmoji(emoji)}>{emoji}</button>
              ))}
            </div>
          )}
          <button type="button" className="icon-button" onClick={() => setShowEmojis(!showEmojis)}>😊</button>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
          <button type="button" className="icon-button" onClick={handleFileAttachment}>📎</button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default TeamChat;
