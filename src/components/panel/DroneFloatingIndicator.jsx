import { useSelector } from "react-redux";
import { selectRedCount } from "../../store/dronesSlice";
import "./DroneFloatingIndicator.css";

export default function DroneFloatingIndicator() {
  const redCount = useSelector(selectRedCount);

  return (
    <div className="floating-indicator">
      <span className="circle">{redCount}</span>
      <span className="text">Drone Flying</span>
    </div>
  );
}