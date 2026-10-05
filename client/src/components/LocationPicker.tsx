import { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';

const DEFAULT_CENTER = { lat: 41.311081, lng: 69.240562 }; // Tashkent

interface Props {
  onLocationSelect: (loc: { lat: number; lng: number }, address: string) => void;
  initialLocation?: { lat: number; lng: number };
}

const mapContainerStyle = { width: '100%', height: '250px' };

export default function LocationPicker({ onLocationSelect, initialLocation }: Props) {
  const { lang } = useApp();
  const [marker, setMarker] = useState(initialLocation || DEFAULT_CENTER);
  const [address, setAddress] = useState('');

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
    id: 'sifat-market-map'
  });

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const loc = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setMarker(loc);
    onLocationSelect(loc, address);

    if (window.google?.maps) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: loc }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          setAddress(results[0].formatted_address);
          onLocationSelect(loc, results[0].formatted_address);
        }
      });
    }
  }, [address, onLocationSelect]);

  if (!isLoaded) {
    return (
      <div className="map-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
        <div style={{ textAlign: 'center', padding: 20 }}>
          <p style={{ marginBottom: 10, color: '#666' }}>{t('selectLocation', lang)}</p>
          <input
            className="form-input"
            placeholder="Lat, Lng (masalan: 41.311, 69.240)"
            onBlur={e => {
              const parts = e.target.value.split(',').map(s => parseFloat(s.trim()));
              if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                const loc = { lat: parts[0], lng: parts[1] };
                setMarker(loc);
                onLocationSelect(loc, e.target.value);
              }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>{t('selectLocation', lang)}</p>
      <div className="map-container">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={marker}
          zoom={15}
          onClick={handleMapClick}
          options={{ disableDefaultUI: true, zoomControl: true }}
        >
          <Marker position={marker} draggable onDragEnd={handleMapClick} />
        </GoogleMap>
      </div>
      {address && <p style={{ fontSize: 13, marginTop: 8, color: '#666' }}>📍 {address}</p>}
    </div>
  );
}

export function openGoogleMapsRoute(destLat: number, destLng: number) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        window.open(
          `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${destLat},${destLng}&travelmode=driving`,
          '_blank'
        );
      },
      () => {
        window.open(
          `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`,
          '_blank'
        );
      }
    );
  } else {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`,
      '_blank'
    );
  }
}

export function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
