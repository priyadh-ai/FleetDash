import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./LiveMap.css";
import { useEffect, useState, useMemo } from "react";
import useVehicles from "../../hooks/useVehicles";
import L from "leaflet";

// Custom vehicle icon factory with type-specific icons and heading rotation
const createVehicleIcon = (status, speed, type = "Truck", heading = 0) => {
  let color;
  if (status === "Offline") {
    color = "#64748b";
  } else if (speed > 80) {
    color = "#ef4444";
  } else if (speed > 50) {
    color = "#f59e0b";
  } else {
    color = "#22c55e";
  }

  // Generate SVG based on vehicle type
  const getVehicleSvg = () => {
    switch (type) {
      case "Car":
        return `
          <g transform="translate(24,24) rotate(${heading})">
            <rect x="-14" y="-8" width="28" height="14" rx="4" fill="${color}" stroke="#fff" stroke-width="1.5"/>
            <rect x="-6" y="-14" width="12" height="7" rx="2" fill="${color}" stroke="#fff" stroke-width="1"/>
            <rect x="-7" y="-3" width="5" height="4" rx="1" fill="#fff" opacity="0.4"/>
            <rect x="2" y="-3" width="5" height="4" rx="1" fill="#fff" opacity="0.4"/>
            <circle cx="-7" cy="7" r="3.5" fill="#fff" stroke="${color}" stroke-width="1.5"/>
            <circle cx="7" cy="7" r="3.5" fill="#fff" stroke="${color}" stroke-width="1.5"/>
          </g>`;
      case "Bus":
        return `
          <g transform="translate(24,24) rotate(${heading})">
            <rect x="-16" y="-12" width="32" height="20" rx="3" fill="${color}" stroke="#fff" stroke-width="1.5"/>
            <rect x="-12" y="-17" width="24" height="6" rx="2" fill="${color}" stroke="#fff" stroke-width="1"/>
            <rect x="-14" y="-6" width="4" height="10" rx="1" fill="#fff" opacity="0.4"/>
            <rect x="-6" y="-6" width="4" height="10" rx="1" fill="#fff" opacity="0.4"/>
            <rect x="2" y="-6" width="4" height="10" rx="1" fill="#fff" opacity="0.4"/>
            <rect x="10" y="-6" width="4" height="10" rx="1" fill="#fff" opacity="0.4"/>
            <circle cx="-8" cy="10" r="4" fill="#fff" stroke="${color}" stroke-width="1.5"/>
            <circle cx="8" cy="10" r="4" fill="#fff" stroke="${color}" stroke-width="1.5"/>
          </g>`;
      case "Bike":
        return `
          <g transform="translate(24,24) rotate(${heading})">
            <rect x="-2" y="-16" width="4" height="14" rx="2" fill="${color}" stroke="#fff" stroke-width="1.5"/>
            <rect x="-8" y="-12" width="16" height="3" rx="1.5" fill="${color}" stroke="#fff" stroke-width="1"/>
            <polygon points="-10,-12 -14,-16 -10,-16" fill="${color}" stroke="#fff" stroke-width="1"/>
            <circle cx="-8" cy="8" r="4.5" fill="#fff" stroke="${color}" stroke-width="1.5"/>
            <circle cx="8" cy="8" r="4.5" fill="#fff" stroke="${color}" stroke-width="1.5"/>
          </g>`;
      case "Van":
        return `
          <g transform="translate(24,24) rotate(${heading})">
            <rect x="-15" y="-10" width="30" height="17" rx="3" fill="${color}" stroke="#fff" stroke-width="1.5"/>
            <rect x="-8" y="-15" width="16" height="6" rx="2" fill="${color}" stroke="#fff" stroke-width="1"/>
            <rect x="-12" y="-4" width="5" height="8" rx="1" fill="#fff" opacity="0.3"/>
            <rect x="-3" y="-4" width="5" height="8" rx="1" fill="#fff" opacity="0.3"/>
            <rect x="6" y="-4" width="5" height="8" rx="1" fill="#fff" opacity="0.3"/>
            <circle cx="-7" cy="9" r="4" fill="#fff" stroke="${color}" stroke-width="1.5"/>
            <circle cx="7" cy="9" r="4" fill="#fff" stroke="${color}" stroke-width="1.5"/>
          </g>`;
      default: // Truck
        return `
          <g transform="translate(24,24) rotate(${heading})">
            <rect x="-14" y="-10" width="28" height="16" rx="3" fill="${color}" stroke="#fff" stroke-width="1.5"/>
            <rect x="-8" y="-14" width="16" height="6" rx="2" fill="${color}" stroke="#fff" stroke-width="1.5"/>
            <rect x="8" y="-6" width="10" height="8" rx="1" fill="${color}" stroke="#fff" stroke-width="1" opacity="0.8"/>
            <circle cx="-8" cy="8" r="4" fill="#fff" stroke="${color}" stroke-width="1.5"/>
            <circle cx="8" cy="8" r="4" fill="#fff" stroke="${color}" stroke-width="1.5"/>
            <rect x="-8" y="-3" width="3" height="5" rx="0.5" fill="#fff" opacity="0.5"/>
            <rect x="5" y="-3" width="4" height="5" rx="0.5" fill="#fff" opacity="0.3"/>
          </g>`;
    }
  };

  return L.divIcon({
    className: "vehicle-marker-icon",
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="38" height="38">${getVehicleSvg()}</svg>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -22]
  });
};

function LiveMap({ vehicles: propVehicles }) {
  const { vehicles: hookVehicles } = useVehicles();
  const vehicles = propVehicles || hookVehicles;
  const [mapVehicles, setMapVehicles] = useState([]);

  useEffect(() => {
    setMapVehicles(vehicles);
  }, [vehicles]);

  const center = useMemo(() => 
    mapVehicles.length > 0 && mapVehicles[0].location
      ? [mapVehicles[0].location.lat, mapVehicles[0].location.lng]
      : [11.0168, 76.9558],
    [mapVehicles]
  );

  // Count by type for legend
  const typeCounts = useMemo(() => {
    const counts = { Truck: 0, Car: 0, Bus: 0, Bike: 0, Van: 0 };
    mapVehicles.forEach(v => {
      const t = v.type || "Truck";
      counts[t] = (counts[t] || 0) + 1;
    });
    return counts;
  }, [mapVehicles]);

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div className="map-header">
        <h3>🗺️ Live Fleet Map</h3>
        <div className="map-legend">
          <span><span style={{ color: "#22c55e" }}>●</span> Active</span>
          <span><span style={{ color: "#f59e0b" }}>●</span> Warning</span>
          <span><span style={{ color: "#ef4444" }}>●</span> Overspeed</span>
          <span><span style={{ color: "#64748b" }}>●</span> Offline</span>
          {typeCounts.Truck > 0 && <span className="legend-type">🚛 {typeCounts.Truck}</span>}
          {typeCounts.Car > 0 && <span className="legend-type">🚗 {typeCounts.Car}</span>}
          {typeCounts.Bus > 0 && <span className="legend-type">🚌 {typeCounts.Bus}</span>}
          {typeCounts.Bike > 0 && <span className="legend-type">🏍️ {typeCounts.Bike}</span>}
          {typeCounts.Van > 0 && <span className="legend-type">🚐 {typeCounts.Van}</span>}
        </div>
      </div>
      <div className="map-wrapper" style={{ height: 400 }}>
        <MapContainer center={center} zoom={5} className="map" style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {mapVehicles.map((vehicle) =>
            vehicle.location && vehicle.location.lat && vehicle.location.lng && (
              <Marker
                key={vehicle._id || vehicle.vehicleId}
                position={[vehicle.location.lat, vehicle.location.lng]}
                icon={createVehicleIcon(vehicle.status, vehicle.speed, vehicle.type, vehicle.heading)}
              >
                <Popup>
                  <div className="vehicle-popup">
                    <h4 className="popup-title">
                      {vehicle.type === "Car" ? "🚗" : vehicle.type === "Bus" ? "🚌" : vehicle.type === "Bike" ? "🏍️" : vehicle.type === "Van" ? "🚐" : "🚛"} {vehicle.vehicleId}
                    </h4>
                    <div className="popup-content">
                      <div><strong>👤 Driver:</strong> {vehicle.driver || "Unknown"}</div>
                      <div><strong>📊 Speed:</strong> <span className={`speed-${vehicle.speed > 80 ? "high" : vehicle.speed > 50 ? "mid" : "low"}`}>{vehicle.speed || 0} km/h</span></div>
                      <div><strong>⛽ Fuel:</strong> {Math.round(vehicle.fuel || 0)}%</div>
                      <div><strong>🔄 Heading:</strong> {vehicle.heading || 0}°</div>
                      <div><strong>🌡️ Engine:</strong> {vehicle.engineTemp || 90}°C</div>
                      <div><strong>🔋 Battery:</strong> {Math.round(vehicle.batteryLevel || 100)}%</div>
                      <div><strong>📍 Location:</strong> {vehicle.location.lat?.toFixed(4)}, {vehicle.location.lng?.toFixed(4)}</div>
                      <div><strong>📡 Status:</strong> <span className={`status-${vehicle.status === "Active" ? "active" : "offline"}`}>{vehicle.status}</span></div>
                      <div><strong>🕐 Updated:</strong> {vehicle.lastUpdated ? new Date(vehicle.lastUpdated).toLocaleTimeString() : "Just now"}</div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          )}
        </MapContainer>
      </div>
    </div>
  );
}

export default LiveMap;