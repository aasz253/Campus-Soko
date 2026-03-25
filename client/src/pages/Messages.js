import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { messageAPI } from '../utils/api';
import { useSocket } from '../context/SocketContext';
import Loading from '../components/Loading';
import { formatDateTime } from '../utils/helpers';
import { MessageCircle, User } from 'lucide-react';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOnline } = useSocket();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const handleNewMessage = () => {
      fetchConversations();
    };
    window.addEventListener('new_message', handleNewMessage);
    return () => window.removeEventListener('new_message', handleNewMessage);
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

  if (loading) return <Loading text="Loading messages..." />;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Messages</h1>
      <p className="text-gray-500 mb-8">Your conversations with buyers and sellers</p>

      {conversations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No messages yet</h3>
          <p className="text-gray-500 mb-6">
            When you chat with a seller or receive messages from buyers, they'll appear here
          </p>
          <Link to="/" className="btn-primary">
            Browse Listings
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {conversations.map((conv, index) => {
            const otherUser = conv.user;
            const lastMessage = conv.lastMessage;
            const isFromThem = lastMessage?.sender?._id !== lastMessage?.receiver?._id;

            return (
              <Link
                key={`${otherUser._id}-${conv.listing?._id}`}
                to={`/chat/${otherUser._id}?listing=${conv.listing?._id}`}
                className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                  index !== conversations.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                    {otherUser.profileImage ? (
                      <img
                        src={otherUser.profileImage}
                        alt={otherUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-primary-600" />
                    )}
                  </div>
                  {isOnline(otherUser._id) && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{otherUser.name}</h3>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {formatDateTime(lastMessage?.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1 truncate">
                    {conv.listing?.title && (
                      <span className="text-primary-600">Re: {conv.listing.title}</span>
                    )}
                  </p>
                  <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                    {isFromThem ? '' : 'You: '}
                    {lastMessage?.message}
                  </p>
                </div>

                {conv.unreadCount > 0 && (
                  <div className="flex-shrink-0">
                    <span className="bg-accent-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {conv.unreadCount}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Messages;
