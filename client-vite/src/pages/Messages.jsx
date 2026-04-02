import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { messageAPI } from '../utils/api';
import Loading from '../components/Loading';
import { getFileUrl } from '../config';

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await messageAPI.getConversations();
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>Messages</h1>

      {conversations.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>No messages yet</p>
          <p style={{ color: '#9ca3af' }}>Start a conversation by messaging a seller!</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
          {conversations.map(conv => (
            <Link
              key={conv._id}
              to={`/chat/${conv.user._id}?listing=${conv.listing?._id || ''}`}
              style={{ display: 'flex', gap: '15px', padding: '20px', borderBottom: '1px solid #e5e7eb', textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                {conv.user?.profileImage ? (
                  <img src={getFileUrl(conv.user.profileImage)} alt={conv.user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#6b7280' }}>{conv.user?.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontWeight: '600' }}>{conv.user?.name}</span>
                  <span style={{ color: '#9ca3af', fontSize: '12px' }}>{conv.lastMessage && new Date(conv.lastMessage.createdAt).toLocaleDateString()}</span>
                </div>
                <p style={{ color: '#6b7280', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {conv.listing?.title ? `Re: ${conv.listing.title} - ` : ''}{conv.lastMessage?.message || 'No messages'}
                </p>
              </div>
              {conv.unread > 0 && (
                <div style={{ width: '24px', height: '24px', background: '#0ea5e9', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>
                  {conv.unread}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
