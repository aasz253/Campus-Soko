import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { messageAPI, listingAPI, authAPI } from '../utils/api';
import { formatDateTime, formatTime } from '../utils/helpers';
import Loading from '../components/Loading';
import {
  ArrowLeft,
  Send,
  User,
  Package,
  Loader2
} from 'lucide-react';

const Chat = () => {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get('listing');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sendMessage, emitTyping, emitStopTyping, markAsRead, isOnline } = useSocket();
  
  const [otherUser, setOtherUser] = useState(null);
  const [listing, setListing] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchChatData();
  }, [userId, listingId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleReceiveMessage = (message) => {
      if (
        (message.sender._id === userId && message.receiver._id === user._id) ||
        (message.sender._id === user._id && message.receiver._id === userId)
      ) {
        setMessages(prev => {
          if (!prev.find(m => m._id === message._id)) {
            return [...prev, message];
          }
          return prev;
        });
        markAsRead(userId);
      }
    };

    const handleTyping = ({ senderId }) => {
      if (senderId === userId) setIsTyping(true);
    };

    const handleStopTyping = ({ senderId }) => {
      if (senderId === userId) setIsTyping(false);
    };

    window.addEventListener('new_message', handleReceiveMessage);
    window.addEventListener('user_typing', handleTyping);
    window.addEventListener('user_stop_typing', handleStopTyping);

    return () => {
      window.removeEventListener('new_message', handleReceiveMessage);
      window.removeEventListener('user_typing', handleTyping);
      window.removeEventListener('user_stop_typing', handleStopTyping);
    };
  }, [userId, user?._id, markAsRead]);

  const fetchChatData = async () => {
    try {
      const [userRes, messagesRes] = await Promise.all([
        authAPI.getUser(userId),
        messageAPI.getConversation(userId)
      ]);

      setOtherUser(userRes.data);
      setMessages(messagesRes.data);

      if (listingId) {
        const listingRes = await listingAPI.getOne(listingId);
        setListing(listingRes.data);
      }

      markAsRead(userId);
    } catch (err) {
      console.error('Failed to fetch chat data:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (e.target.value) {
      emitTyping(userId);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        emitStopTyping(userId);
      }, 2000);
    } else {
      emitStopTyping(userId);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    emitStopTyping(userId);

    try {
      const messageData = {
        receiverId: userId,
        listingId: listingId,
        message: newMessage.trim()
      };

      sendMessage(messageData);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(msg => {
      const date = new Date(msg.createdAt).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  if (loading) return <Loading text="Loading chat..." />;

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <Link to={`/listing/${listingId}`} className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {otherUser?.profileImage ? (
              <img src={otherUser.profileImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-primary-600" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900 truncate">{otherUser?.name}</h2>
              {isOnline(otherUser?._id) && (
                <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
              )}
            </div>
            {listing && (
              <p className="text-sm text-primary-600 truncate flex items-center gap-1">
                <Package className="w-3 h-3" />
                {listing.title}
              </p>
            )}
          </div>
        </Link>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {Object.entries(messageGroups).map(([date, msgs]) => (
            <div key={date}>
              <div className="text-center mb-4">
                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  {new Date(date).toLocaleDateString('en-KE', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              
              {msgs.map(msg => {
                const isMe = msg.sender._id === user._id;
                return (
                  <div
                    key={msg._id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-3`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isMe
                          ? 'bg-primary-600 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-900 rounded-bl-md'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                      <p className={`text-xs mt-1 ${
                        isMe ? 'text-primary-200' : 'text-gray-400'
                      }`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start mb-3">
              <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t bg-gray-50">
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1 input-field"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="btn-primary px-6 flex items-center gap-2"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
