import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listingAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

export default function Dashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    try {
      const res = await listingAPI.getMyListings();
      setListings(res.data);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await listingAPI.delete(id);
      setListings(prev => prev.filter(l => l._id !== id));
    } catch (err) {
      alert('Failed to delete listing');
    }
  };

  if (loading) return <Loading />;

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>My Dashboard</h1>
        <Link to="/post" style={{ background: '#0ea5e9', color: 'white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
          + Post New Item
        </Link>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Account Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div style={{ textAlign: 'center', padding: '20px', background: '#f0f9ff', borderRadius: '8px' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0ea5e9' }}>{listings.length}</div>
            <div style={{ color: '#6b7280' }}>Total Listings</div>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', background: '#f0fdf4', borderRadius: '8px' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#16a34a' }}>{listings.filter(l => !l.isSold).length}</div>
            <div style={{ color: '#6b7280' }}>Active</div>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', background: '#fef3c7', borderRadius: '8px' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#d97706' }}>{listings.filter(l => l.isSold).length}</div>
            <div style={{ color: '#6b7280' }}>Sold</div>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>My Listings</h2>
        {listings.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>You haven't posted any items yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {listings.map(listing => (
              <div key={listing._id} style={{ display: 'flex', gap: '15px', padding: '15px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <div style={{ width: '100px', height: '80px', background: '#f3f4f6', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                  {listing.images && listing.images.length > 0 ? (
                    <img src={listing.images[0]} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: '600', marginBottom: '5px' }}>{listing.title}</h3>
                  <p style={{ color: '#0ea5e9', fontWeight: 'bold' }}>KES {listing.price.toLocaleString()}</p>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>{listing.category} • {listing.views} views</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Link to={`/listing/${listing._id}`} style={{ padding: '8px 16px', background: '#f3f4f6', borderRadius: '6px', textDecoration: 'none', color: '#374151', fontSize: '14px', textAlign: 'center' }}>View</Link>
                  <button onClick={() => handleDelete(listing._id)} style={{ padding: '8px 16px', background: '#fee2e2', border: 'none', borderRadius: '6px', color: '#dc2626', fontSize: '14px', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
