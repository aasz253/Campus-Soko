import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { listingAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <div>
          <div style={{ aspectRatio: '1', background: '#e5e7eb', borderRadius: '12px', overflow: 'hidden', marginBottom: '15px' }}>
            {listing.images && listing.images.length > 0 ? (
              <img src={`http://localhost:5001${listing.images[0]}`} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : listing.videos && listing.videos.length > 0 ? (
              <video src={`http://localhost:5001${listing.videos[0]}`} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px' }}>📦</div>
            )}
          </div>
          {(listing.images && listing.images.length > 1) || (listing.videos && listing.videos.length > 0) ? (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {listing.images?.map((img, idx) => (
                <button key={`img-${idx}`} onClick={() => {}} style={{ width: '60px', height: '60px', border: 'none', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }}>
                  <img src={`http://localhost:5001${img}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
              {listing.videos?.map((vid, idx) => (
                <video key={`vid-${idx}`} src={`http://localhost:5001${vid}`} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
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

          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', color: '#6b7280' }}>
            <span>📍 {listing.location}</span>
            <span>👁 {listing.views} views</span>
            <span>📅 {new Date(listing.createdAt).toLocaleDateString()}</span>
          </div>

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
          ) : isAuthenticated ? (
            <Link to={`/chat/${listing.user?._id}?listing=${listing._id}`} style={{ display: 'block', padding: '14px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', textAlign: 'center', textDecoration: 'none' }}>
              💬 Message Seller
            </Link>
          ) : (
            <Link to="/login" style={{ display: 'block', padding: '14px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', textAlign: 'center', textDecoration: 'none' }}>
              Login to Message
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
