import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listingAPI } from '../utils/api';
import Loading from '../components/Loading';

const CATEGORIES = ['All', 'Electronics', 'Books', 'Clothes', 'Furniture', 'Others'];

export default function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    fetchListings();
  }, [category]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await listingAPI.getAll({
        category: category !== 'All' ? category : undefined,
      });
      setListings(res.data.listings);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(to right, #0284c7, #f97316)', color: 'white', padding: '40px 20px', borderRadius: '16px', marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Find Great Deals on Campus</h1>
        <p>Buy and sell items with fellow students</p>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              background: category === cat ? '#0ea5e9' : '#e5e7eb',
              color: category === cat ? 'white' : '#374151',
              cursor: 'pointer'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : listings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          <p>No listings found</p>
          <p>Be the first to post an item!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {listings.map(listing => (
            <Link key={listing._id} to={`/listing/${listing._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: '0.2s' }}>
                <div style={{ height: '200px', background: '#e5e7eb', position: 'relative' }}>
                  {listing.images && listing.images.length > 0 ? (
                    <img src={`http://localhost:5001${listing.images[0]}`} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : listing.videos && listing.videos.length > 0 ? (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e' }}>
                      <span style={{ fontSize: '40px' }}>🎬</span>
                    </div>
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>📦</div>
                  )}
                  {listing.videos && listing.videos.length > 0 && (
                    <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#dc2626', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>🎬 Video</span>
                  )}
                  <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' }}>{listing.category}</span>
                </div>
                <div style={{ padding: '15px' }}>
                  <h3 style={{ fontWeight: '600', marginBottom: '8px' }}>{listing.title}</h3>
                  <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{listing.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0ea5e9' }}>KES {listing.price.toLocaleString()}</span>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>📍 {listing.location}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
