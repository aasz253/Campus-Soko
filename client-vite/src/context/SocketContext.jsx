import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      const newSocket = io('http://localhost:5001', {
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        newSocket.emit('join', user._id);
      });

      newSocket.on('user_online', ({ userId }) => {
        setOnlineUsers(prev => [...new Set([...prev, userId])]);
      });

      newSocket.on('user_offline', ({ userId }) => {
        setOnlineUsers(prev => prev.filter(id => id !== userId));
      });

      newSocket.on('receive_message', (message) => {
        window.dispatchEvent(new CustomEvent('new_message', { detail: message }));
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user?._id]);

  const sendMessage = (data) => {
    if (socket) {
      socket.emit('send_message', data);
    }
  };

  const emitTyping = (receiverId) => {
    if (socket && user) {
      socket.emit('typing', { senderId: user._id, receiverId });
    }
  };

  const emitStopTyping = (receiverId) => {
    if (socket && user) {
      socket.emit('stop_typing', { senderId: user._id, receiverId });
    }
  };

  const markAsRead = (otherUserId) => {
    if (socket && user) {
      socket.emit('mark_read', { senderId: otherUserId, receiverId: user._id });
    }
  };

  const sendVideoSignal = (to, data) => {
    if (socket && user) {
      socket.emit('video_call', { from: user._id, to, ...data });
    }
  };

  return (
    <SocketContext.Provider value={{
      socket,
      onlineUsers,
      sendMessage,
      emitTyping,
      emitStopTyping,
      markAsRead,
      sendVideoSignal,
      isOnline: (userId) => onlineUsers.includes(userId)
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
