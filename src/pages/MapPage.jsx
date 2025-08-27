// src/pages/MapPage.jsx
import MapView from "../components/map/MapView";
import DronePanel from "../components/panel/DronePanel";

export default function MapPage() {
  return (
    <div style={{ display: "flex", height: "100%", width: "100%" }}>
      <DronePanel />
      <div style={{ flex: 1, position: "relative" }}>
        <MapView />
      </div>
    </div>
  );
}