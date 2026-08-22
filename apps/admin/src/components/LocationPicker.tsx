'use client';

import { useEffect, useRef, useState } from 'react';

interface LocationPickerProps {
  onLocationSelect: (latitude: number, longitude: number) => void;
  initialLatitude?: number;
  initialLongitude?: number;
  height?: number | string;
}

export function LocationPicker({
  onLocationSelect,
  initialLatitude = 9.2142,
  initialLongitude = 123.515,
  height = 400,
}: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(() => (initialLatitude && initialLongitude ? { latitude: initialLatitude, longitude: initialLongitude } : null));
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (mapLoaded || !mapContainerRef.current) return;

    // Load Leaflet dynamically
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      const L = (window as any).L;

      // Create map
      const map = L.map(mapContainerRef.current).setView([initialLatitude || 9.2142, initialLongitude || 123.515], 12);

      // Add OSM tiles
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      // Add initial marker if location is set
      if (selectedLocation) {
        const marker = L.marker([selectedLocation.latitude, selectedLocation.longitude], {
          draggable: true,
        }).addTo(map);

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          setSelectedLocation({ latitude: pos.lat, longitude: pos.lng });
          onLocationSelect(pos.lat, pos.lng);
        });

        markerRef.current = marker;
      }

      // Handle map clicks
      map.on('click', (e: any) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        // Remove old marker
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }

        // Add new marker
        const marker = L.marker([lat, lng], { draggable: true }).addTo(map);

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          setSelectedLocation({ latitude: pos.lat, longitude: pos.lng });
          onLocationSelect(pos.lat, pos.lng);
        });

        markerRef.current = marker;
        setSelectedLocation({ latitude: lat, longitude: lng });
        onLocationSelect(lat, lng);
      });

      // Invalidate map size to ensure it displays correctly
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

      setMapLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={mapContainerRef}
        style={{
          height: typeof height === 'number' ? `${height}px` : height,
          width: '100%',
          borderRadius: '12px',
          border: '1px solid #E4E0D8',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: '#f0f0f0',
          minHeight: '300px',
          zIndex: 1,
        }}
      />

      {selectedLocation && (
        <div className="flex flex-col gap-1 p-3 bg-surface border border-border rounded-lg text-sm">
          <div>
            Latitude: <span className="font-bold">{selectedLocation.latitude.toFixed(6)}</span>
          </div>
          <div>
            Longitude: <span className="font-bold">{selectedLocation.longitude.toFixed(6)}</span>
          </div>
        </div>
      )}

      {!selectedLocation && (
        <div className="flex items-center justify-center p-3 bg-surface border border-primary rounded-lg text-sm text-primary">
          Click on the map or drag the marker to select a location
        </div>
      )}
    </div>
  );
}
