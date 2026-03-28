import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { messageAPI, authAPI } from '../utils/api';
import Loading from '../components/Loading';

export default function Chat() {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get('listing');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sendMessage, markAsRead } = useSocket();
  const [otherUser, setOtherUser] = useState(null);
  const [listing, setListing] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [userId, listingId]);

  useEffect(() => {
    const handleReceiveMessage = (message) => {
      if (message.sender === userId || message.sender._id === userId) {
        setMessages(prev => [...prev, message]);
        markAsRead(userId);
      }
    };
    window.addEventListener('receive_message', handleReceiveMessage);
    return () => window.removeEventListener('receive_message', handleReceiveMessage);
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchData = async () => {
    try {
      const [userRes, msgRes] = await Promise.all([
        authAPI.getUser(userId),
        messageAPI.getConversation(userId)
      ]);
      setOtherUser(userRes.data);
      setMessages(msgRes.data);
      if (listingId) {
        const listingRes = await listingAPI.getOne(listingId);
        setListing(listingRes.data);
      }
      markAsRead(userId);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      senderId: user._id,
      receiverId: userId,
      listingId: listingId || undefined,
      message: newMessage
    };

    sendMessage(messageData);
    setMessages(prev => [...prev, { ...messageData, sender: user, createdAt: new Date() }]);
    setNewMessage('');
  };

  if (loading) return <Loading />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', borderBottom: '1px solid #e5e7eb', background: 'white', borderRadius: '12px 12px 0 0' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>←</button>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {otherUser?.profileImage ? (
            <img src={otherUser.profileImage} alt={otherUser.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <span>{otherUser?.name?.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div>
          <p style={{ fontWeight: '600' }}>{otherUser?.name}</p>
          {listing && (
            <Link to={`/listing/${listing._id}`} style={{ fontSize: '12px', color: '#0ea5e9', textDecoration: 'none' }}>
              Re: {listing.title}
            </Link>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px', background: '#f9fafb' }}>
        {messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: '40px' }}>No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender === user?._id || msg.sender?._id === user?._id;
            return (
              <div key={idx} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: '15px' }}>
                <div style={{ maxWidth: '70%', padding: '12px 16px', borderRadius: '16px', background: isMe ? '#0ea5e9' : 'white', color: isMe ? 'white' : '#374151', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                  <p>{msg.message}</p>
                  <p style={{ fontSize: '11px', opacity: 0.7, marginTop: '5px' }}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', padding: '15px', borderTop: '1px solid #e5e7eb', background: 'white', borderRadius: '0 0 12px 12px' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '12px', border: '1px solid #d1d5db', borderRadius: '24px', outline: 'none' }}
        />
        <button type="submit" style={{ padding: '12px 24px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '24px', cursor: 'pointer', fontWeight: '600' }}>
          Send
        </button>
      </form>
    </div>
  );
}
