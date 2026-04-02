import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { listingAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import { getFileUrl } from '../config';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Get time-based greeting
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Hello';
};

// Generate WhatsApp link with pre-filled message
const getWhatsAppLink = (phone, listingTitle) => {
  const greeting = getGreeting();
  const message = `${greeting}, I'm interested in your listing: "${listingTitle}"`;
  const encodedMessage = encodeURIComponent(message);
  // Remove any non-numeric characters from phone
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState({ type: 'image', url: '' });
  const videoRef = useRef(null);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const res = await listingAPI.getOne(id);
      setListing(res.data);
    } catch (err) {
      console.error('Failed to fetch listing:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await listingAPI.delete(id);
      navigate('/');
    } catch (err) {
      alert('Failed to delete listing');
    }
  };

  if (loading) return <Loading />;
  if (!listing) return <div style={{ padding: '40px', textAlign: 'center' }}>Listing not found</div>;

  const isOwner = user?._id === listing.user?._id;

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', marginBottom: '20px', color: '#6b7280' }}>
        ← Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }}>
        <div>
          <div style={{ aspectRatio: '4/3', background: '#000', borderRadius: '12px', overflow: 'hidden', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {activeMedia.type === 'video' ? (
              <video
                ref={videoRef}
                src={activeMedia.url}
                controls
                autoPlay
                preload="auto"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : activeMedia.type === 'image' ? (
              <img src={activeMedia.url} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : listing.images && listing.images.length > 0 ? (
              <img src={getFileUrl(listing.images[0])} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : listing.videos && listing.videos.length > 0 ? (
              <video src={getFileUrl(listing.videos[0])} controls preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <div style={{ fontSize: '80px' }}>📦</div>
            )}
          </div>
          {(listing.images && listing.images.length > 1) || (listing.videos && listing.videos.length > 0) ? (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {listing.images?.map((img, idx) => (
                <button
                  key={`img-${idx}`}
                  onClick={() => setActiveMedia({ type: 'image', url: getFileUrl(img) })}
                  style={{
                    width: '80px',
                    height: '80px',
                    border: activeMedia.url === getFileUrl(img) ? '3px solid #0ea5e9' : '2px solid #e5e7eb',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  <img src={getFileUrl(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
              {listing.videos?.map((vid, idx) => (
                <button
                  key={`vid-${idx}`}
                  onClick={() => {
                    setActiveMedia({ type: 'video', url: getFileUrl(vid) });
                  }}
                  style={{
                    width: '80px',
                    height: '80px',
                    border: activeMedia.url === getFileUrl(vid) ? '3px solid #0ea5e9' : '2px solid #e5e7eb',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    padding: 0,
                    position: 'relative',
                    background: '#1a1a2e'
                  }}
                >
                  <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '24px' }}>▶️</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
            <span style={{ background: '#e5e7eb', padding: '6px 12px', borderRadius: '20px', fontSize: '14px' }}>{listing.category}</span>
            {listing.isBoosted && (
              <span style={{ background: '#f97316', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '14px' }}>⚡ Boosted</span>
            )}
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>{listing.title}</h1>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#0ea5e9', marginBottom: '20px' }}>KES {listing.price.toLocaleString()}</p>

          <p style={{ color: '#4b5563', marginBottom: '20px', lineHeight: '1.6' }}>{listing.description}</p>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', color: '#6b7280', flexWrap: 'wrap' }}>
            <span>📍 {listing.location}</span>
            <span>👁 {listing.views} views</span>
            <span>📅 {new Date(listing.createdAt).toLocaleDateString()}</span>
          </div>

          {listing.coordinates?.latitude && listing.coordinates?.longitude && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontWeight: '600', marginBottom: '10px', color: '#374151' }}>📍 Pinned Location</p>
              <div style={{
                height: '200px',
                width: '100%',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #e5e7eb'
              }}>
                <MapContainer
                  center={[listing.coordinates.latitude, listing.coordinates.longitude]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[listing.coordinates.latitude, listing.coordinates.longitude]}>
                    <Popup>
                      <strong>{listing.title}</strong><br />
                      {listing.location}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
              <a
                href={`https://www.openstreetmap.org/?mlat=${listing.coordinates.latitude}&mlon=${listing.coordinates.longitude}#map=15/${listing.coordinates.latitude}/${listing.coordinates.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  marginTop: '8px',
                  color: '#0ea5e9',
                  fontSize: '14px',
                  textDecoration: 'none'
                }}
              >
                Open in OpenStreetMap →
              </a>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', background: '#f9fafb', borderRadius: '12px', marginBottom: '20px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
              {listing.user?.profileImage ? (
                <img src={listing.user.profileImage} alt={listing.user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <span>{listing.user?.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <p style={{ fontWeight: '600' }}>{listing.user?.name}</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Seller</p>
            </div>
          </div>

          {isOwner ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to={`/dashboard`} style={{ flex: 1, padding: '14px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', textDecoration: 'none', textAlign: 'center' }}>
                Edit Listing
              </Link>
              <button onClick={handleDelete} style={{ padding: '14px 20px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>
                Delete
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {isAuthenticated ? (
                <Link to={`/chat/${listing.user?._id}?listing=${listing._id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', background: '#0ea5e9', color: 'white', borderRadius: '10px', fontSize: '17px', fontWeight: '600', textDecoration: 'none' }}>
                  💬 Chat with Seller
                </Link>
              ) : (
                <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', background: '#0ea5e9', color: 'white', borderRadius: '10px', fontSize: '17px', fontWeight: '600', textDecoration: 'none' }}>
                  🔐 Login to Chat
                </Link>
              )}
              {listing.whatsapp && (
                <a
                  href={getWhatsAppLink(listing.whatsapp, listing.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '16px',
                    background: '#25d366',
                    color: 'white',
                    borderRadius: '10px',
                    fontSize: '17px',
                    fontWeight: '600',
                    textDecoration: 'none'
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
