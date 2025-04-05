import React from 'react';
import { MapContainer, TileLayer, Circle, Popup, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const safeZones = [
  { lat: 37.7749, lng: -122.4194, radius: 500, label: 'Downtown SF - Well Lit', color: 'green' },
  { lat: 37.7849, lng: -122.4094, radius: 300, label: 'Powell Station - Police Nearby', color: 'blue' },
  { lat: 37.7649, lng: -122.4294, radius: 400, label: 'Mission District - Community Active', color: 'purple' },
  { lat: 37.7680, lng: -122.4312, radius: 350, label: 'Dolores Park - High Foot Traffic', color: 'yellow' },
  { lat: 37.7718, lng: -122.4478, radius: 250, label: 'Alamo Square - Open Visibility', color: 'red' },
  { lat: 37.7925, lng: -122.3977, radius: 200, label: 'Embarcadero - Tourist Area', color: 'orange' },
  { lat: 37.7810, lng: -122.4124, radius: 300, label: 'Union Square - Monitored Area', color: 'cyan' },
];

export default function MapView() {
  return (
    <div className="h-screen w-full">
      <MapContainer
        center={[37.7749, -122.4194]}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {safeZones.map((zone, i) => (
          <Circle
            key={i}
            center={[zone.lat, zone.lng]}
            radius={zone.radius}
            pathOptions={{
              color: zone.color,
              fillColor: zone.color,
              fillOpacity: 0.4,
            }}
          >
            <Popup>{zone.label}</Popup>
          </Circle>
        ))}

        <Marker position={[37.765, -122.45]}>
          <Popup>
            Each circle represents a <strong>unique safe zone</strong> based on lighting, traffic, or community reporting.
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
