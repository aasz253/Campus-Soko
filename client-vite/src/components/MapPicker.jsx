import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map clicks
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
      });
    },
  });

  return position ? <Marker position={[position.latitude, position.longitude]} icon={customIcon} /> : null;
}

export default function MapPicker({ coordinates, onLocationChange }) {
  const [position, setPosition] = useState(
    coordinates?.latitude && coordinates?.longitude
      ? { latitude: coordinates.latitude, longitude: coordinates.longitude }
      : null
  );
  const [loading, setLoading] = useState(false);

  // Default to Nairobi, Kenya (campus location)
  const defaultCenter = [-1.2921, 36.8219];
  const defaultZoom = 13;

  const center = position
    ? [position.latitude, position.longitude]
    : defaultCenter;

  useEffect(() => {
    if (position) {
      onLocationChange(position);
    }
  }, [position]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
        setLoading(false);
      },
      (err) => {
        alert('Unable to get your location. Please click on the map to set location.');
        setLoading(false);
      }
    );
  };

  const handleClearLocation = () => {
    setPosition(null);
    onLocationChange({ latitude: null, longitude: null });
  };

  return (
    <div>
      <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={loading}
          style={{
            padding: '8px 16px',
            background: '#0ea5e9',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          {loading ? '📍 Getting location...' : '📍 Use My Location'}
        </button>
        {position && (
          <button
            type="button"
            onClick={handleClearLocation}
            style={{
              padding: '8px 16px',
              background: '#fee2e2',
              color: '#dc2626',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      <div style={{
        height: '300px',
        width: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #d1d5db'
      }}>
        <MapContainer
          center={center}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>

      <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
        {position
          ? `📍 Location set: ${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`
          : 'Click on the map to pin the exact location of your item'}
      </p>
    </div>
  );
}
