import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { messageAPI, authAPI, listingAPI } from '../utils/api';
import Loading from '../components/Loading';
import axios from 'axios';
import { API_BASE_URL, getFileUrl } from '../config';

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
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);

  useEffect(() => {
    fetchData();
  }, [userId, listingId]);

  useEffect(() => {
    const handleReceiveMessage = (event) => {
      const message = event.detail;
      if (message.sender === userId || message.sender._id === userId) {
        setMessages(prev => [...prev, message]);
        markAsRead(userId);
      }
    };
    window.addEventListener('receive_message', handleReceiveMessage);
    
    const handleVideoCall = (event) => {
      const { from, type, offer, answer, candidate } = event.detail;
      if (from === userId) {
        if (type === 'offer') {
          setIncomingCall({ offer, from });
        } else if (type === 'answer') {
          handleAnswer(answer);
        } else if (type === 'ice-candidate') {
          handleNewICECandidate(candidate);
        }
      }
    };
    window.addEventListener('video_call', handleVideoCall);
    
    return () => {
      window.removeEventListener('receive_message', handleReceiveMessage);
      window.removeEventListener('video_call', handleVideoCall);
      if (peerConnection.current) {
        peerConnection.current.close();
      }
    };
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
      message: newMessage,
      type: 'text'
    };

    sendMessage(messageData);
    setMessages(prev => [...prev, { ...messageData, sender: user, createdAt: new Date() }]);
    setNewMessage('');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('media', file);
      
      const res = await axios.post(`${API_BASE_URL}/listings/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const imageUrl = res.data.media[0].url;
      
      const messageData = {
        senderId: user._id,
        receiverId: userId,
        listingId: listingId || undefined,
        message: imageUrl,
        type: 'image'
      };
      
      sendMessage(messageData);
      setMessages(prev => [...prev, { ...messageData, sender: user, createdAt: new Date() }]);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload image');
    }
    setUploading(false);
  };

  const startVideoCall = async () => {
    setShowVideoCall(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = stream;
      
      peerConnection.current = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      
      stream.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, stream);
      });
      
      peerConnection.current.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
      };
      
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          window.dispatchEvent(new CustomEvent('send_signal', {
            detail: { to: userId, type: 'ice-candidate', candidate: event.candidate }
          }));
        }
      };
      
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      
      window.dispatchEvent(new CustomEvent('send_signal', {
        detail: { to: userId, type: 'offer', offer }
      }));
    } catch (err) {
      console.error('Failed to start video call:', err);
      alert('Could not access camera/microphone');
      setShowVideoCall(false);
    }
  };

  const handleOffer = async (offer) => {
    try {
      peerConnection.current = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      
      peerConnection.current.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
      };
      
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          window.dispatchEvent(new CustomEvent('send_signal', {
            detail: { to: incomingCall.from, type: 'ice-candidate', candidate: event.candidate }
          }));
        }
      };
      
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = stream;
      
      stream.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, stream);
      });
      
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      
      window.dispatchEvent(new CustomEvent('send_signal', {
        detail: { to: incomingCall.from, type: 'answer', answer }
      }));
      
      setShowVideoCall(true);
      setIncomingCall(null);
    } catch (err) {
      console.error('Failed to handle offer:', err);
    }
  };

  const handleAnswer = async (answer) => {
    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleNewICECandidate = async (candidate) => {
    await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
  };

  const endCall = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    setShowVideoCall(false);
  };

  if (loading) return <Loading />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', maxWidth: '800px', margin: '0 auto' }}>
      {showVideoCall && (
        <div style={{ position: 'relative', height: '300px', background: '#000', borderRadius: '12px', marginBottom: '10px', overflow: 'hidden' }}>
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <video ref={localVideoRef} autoPlay playsInline muted style={{ position: 'absolute', bottom: '10px', right: '10px', width: '120px', height: '90px', borderRadius: '8px', objectFit: 'cover', border: '2px solid white' }} />
          <button onClick={endCall} style={{ position: 'absolute', top: '10px', right: '10px', background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
            End Call
          </button>
        </div>
      )}
      
      {incomingCall && (
        <div style={{ background: '#dcfce7', padding: '15px', borderRadius: '8px', marginBottom: '10px', textAlign: 'center' }}>
          <p>Incoming video call from {otherUser?.name}</p>
          <button onClick={() => handleOffer(incomingCall.offer)} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', marginRight: '10px' }}>Accept</button>
          <button onClick={() => setIncomingCall(null)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Decline</button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', borderBottom: '1px solid #e5e7eb', background: 'white', borderRadius: '12px 12px 0 0' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>←</button>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {otherUser?.profileImage ? (
            <img src={getFileUrl(otherUser.profileImage)} alt={otherUser.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
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
        <button onClick={startVideoCall} style={{ marginLeft: 'auto', background: '#0ea5e9', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
          📹 Video Call
        </button>
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
                  {msg.type === 'image' ? (
                    <img src={getFileUrl(msg.message)} alt="sent" style={{ maxWidth: '200px', borderRadius: '8px' }} />
                  ) : (
                    <p>{msg.message}</p>
                  )}
                  <p style={{ fontSize: '11px', opacity: 0.7, marginTop: '5px' }}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', padding: '15px', borderTop: '1px solid #e5e7eb', background: 'white', borderRadius: '0 0 12px 12px' }}>
        <label style={{ cursor: 'pointer', padding: '12px', background: '#f3f4f6', borderRadius: '8px' }}>
          📷
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
        </label>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={uploading ? 'Uploading...' : 'Type a message...'}
          disabled={uploading}
          style={{ flex: 1, padding: '12px', border: '1px solid #d1d5db', borderRadius: '24px', outline: 'none' }}
        />
        <button type="submit" disabled={uploading} style={{ padding: '12px 24px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '24px', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: '600' }}>
          Send
        </button>
      </form>
    </div>
  );
}
