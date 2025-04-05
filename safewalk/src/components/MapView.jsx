import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const safeZones = [
  { lat: 37.7749, lng: -122.4194, radius: 500, label: "Downtown SF" },
  { lat: 37.7849, lng: -122.4094, radius: 400, label: "Powell Station" },
];

export default function MapView() {
  return (
    <div className="h-screen w-full">
      <MapContainer center={[37.7749, -122.4194]} zoom={13} className="h-full w-full z-0">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {safeZones.map((zone, i) => (
          <Circle
            key={i}
            center={[zone.lat, zone.lng]}
            radius={zone.radius}
            pathOptions={{ color: 'green', fillOpacity: 0.3 }}
          >
            <Popup>{zone.label}</Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
}
