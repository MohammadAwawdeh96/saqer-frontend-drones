import "./DronePanel.css";

export default function DroneListItem({ drone, active, onClick }) {
  return (
    <div
      className={`drone-item ${active ? "active" : ""}`}
      onClick={onClick}
    >
   
      <div className="drone-left">
        <div className="drone-name">{drone.name}</div>
        <div className="drone-meta">
          <div>Serial #: {drone.serial}</div>
          <div>
            Registration #: {drone.registration}
          </div>
          <div>Pilot: {drone.pilot}</div>
          <div>Organization: {drone.organization}</div>
        </div>
      </div>

     
      <div className="drone-status">
        <span
          className={`status-dot ${drone.allowed ? "green" : "red"}`}
        ></span>
      </div>
    </div>
  );
}